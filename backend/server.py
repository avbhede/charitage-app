from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Request
from contextlib import asynccontextmanager
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import razorpay
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours
security = HTTPBearer()

# Razorpay Client
razorpay_client = razorpay.Client(auth=(os.environ.get('RAZORPAY_KEY_ID', ''), os.environ.get('RAZORPAY_KEY_SECRET', '')))

# Lifespan event handler (replaces deprecated @app.on_event)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: nothing needed here (client is created at module level)
    yield
    # Shutdown: close the MongoDB connection
    client.close()

# Create the main app
app = FastAPI(lifespan=lifespan)
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    phone: Optional[str] = None
    pan: Optional[str] = None
    role: str = "donor"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    pan: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Campaign(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str
    goal_amount: float
    raised_amount: float = 0.0
    image_url: str
    status: str = "active"
    beneficiaries_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CampaignCreate(BaseModel):
    title: str
    description: str
    category: str
    goal_amount: float
    image_url: str
    beneficiaries_count: int = 0
    status: str = "active"
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class Donation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    campaign_id: Optional[str] = None
    amount: float
    donor_name: str
    donor_email: EmailStr
    donor_phone: str
    donor_pan: Optional[str] = None
    razorpay_order_id: str = ""
    razorpay_payment_id: Optional[str] = None
    razorpay_subscription_id: Optional[str] = None
    is_recurring: bool = False
    status: str = "pending"
    receipt_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DonationCreate(BaseModel):
    campaign_id: Optional[str] = None
    amount: float
    donor_name: str
    donor_email: EmailStr
    donor_phone: str
    donor_pan: Optional[str] = None
    is_recurring: bool = False

class Blog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    content: str
    excerpt: str
    image_url: str
    category: str
    tags: List[str] = []
    author: str
    published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlogCreate(BaseModel):
    title: str
    content: str
    excerpt: str
    image_url: str
    category: str
    tags: List[str] = []
    author: str

class TeamMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    designation: str
    bio: str
    image_url: str
    category: str
    order: int = 0

class Volunteer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    interest_area: str
    message: str
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VolunteerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: Optional[str] = None
    interest_area: str
    message: str
    registration_type: str = "volunteer"

class MemberCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: Optional[str] = None
    interest_area: str
    message: str
    registration_type: str = "member"

class GalleryItemCreate(BaseModel):
    title: str
    type: str
    url: str
    thumbnail_url: Optional[str] = None
    category: str

class DocumentCreate(BaseModel):
    title: str
    category: str
    file_url: str

class Document(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: str
    file_url: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GalleryItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    type: str
    url: str
    thumbnail_url: Optional[str] = None
    category: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ImpactStats(BaseModel):
    total_beneficiaries: int
    total_funds_raised: float
    active_campaigns: int
    volunteers: int

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

# Auth Routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        pan=user_data.pan
    )
    
    user_dict = user.model_dump()
    user_dict["hashed_password"] = hashed_password
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    
    await db.users.insert_one(user_dict)
    access_token = create_access_token(data={"sub": user.id})
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc or not verify_password(credentials.password, user_doc.get("hashed_password", "")):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'hashed_password'})
    access_token = create_access_token(data={"sub": user.id})
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Campaign Routes
@api_router.get("/campaigns", response_model=List[Campaign])
async def get_campaigns(status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    campaigns = await db.campaigns.find(query, {"_id": 0}).to_list(100)
    for campaign in campaigns:
        if isinstance(campaign.get('created_at'), str):
            campaign['created_at'] = datetime.fromisoformat(campaign['created_at'])
    return campaigns

@api_router.get("/campaigns/{campaign_id}", response_model=Campaign)
async def get_campaign(campaign_id: str):
    campaign = await db.campaigns.find_one({"id": campaign_id}, {"_id": 0})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if isinstance(campaign.get('created_at'), str):
        campaign['created_at'] = datetime.fromisoformat(campaign['created_at'])
    return Campaign(**campaign)

@api_router.post("/campaigns", response_model=Campaign)
async def create_campaign(campaign_data: CampaignCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    campaign = Campaign(
        title=campaign_data.title,
        description=campaign_data.description,
        category=campaign_data.category,
        goal_amount=campaign_data.goal_amount,
        image_url=campaign_data.image_url,
        beneficiaries_count=campaign_data.beneficiaries_count
    )
    
    campaign_dict = campaign.model_dump()
    campaign_dict["created_at"] = campaign_dict["created_at"].isoformat()
    
    await db.campaigns.insert_one(campaign_dict)
    return campaign

@api_router.put("/campaigns/{campaign_id}", response_model=Campaign)
async def update_campaign(campaign_id: str, campaign_data: CampaignCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    existing = await db.campaigns.find_one({"id": campaign_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    update_data = {
        "title": campaign_data.title,
        "description": campaign_data.description,
        "category": campaign_data.category,
        "goal_amount": campaign_data.goal_amount,
        "image_url": campaign_data.image_url,
        "beneficiaries_count": campaign_data.beneficiaries_count
    }
    await db.campaigns.update_one({"id": campaign_id}, {"$set": update_data})
    
    updated = await db.campaigns.find_one({"id": campaign_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Campaign(**updated)

@api_router.delete("/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    result = await db.campaigns.delete_one({"id": campaign_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"status": "success", "message": "Campaign deleted"}

# Donation Routes
@api_router.get("/config")
async def get_config():
    """Return public configuration for frontend (e.g. Razorpay key)"""
    return {
        "razorpay_key_id": os.environ.get('RAZORPAY_KEY_ID', '')
    }

@api_router.post("/donations/create-order")
async def create_donation_order(donation_data: DonationCreate):
    amount_in_paise = int(donation_data.amount * 100)
    key_id = os.environ.get('RAZORPAY_KEY_ID', '')
    
    if donation_data.is_recurring:
        # --- RECURRING / SIP (Razorpay Subscription) ---
        try:
            # Step 1: Create a monthly plan
            plan = razorpay_client.plan.create({
                "period": "monthly",
                "interval": 1,
                "item": {
                    "name": f"Monthly Donation - Charitage Foundation",
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "description": f"Monthly recurring donation of Rs.{donation_data.amount}"
                }
            })
            
            # Step 2: Create a subscription on that plan
            subscription = razorpay_client.subscription.create({
                "plan_id": plan["id"],
                "total_count": 12,  # 12 months
                "quantity": 1,
                "customer_notify": 1,
                "notes": {
                    "donor_name": donation_data.donor_name,
                    "donor_email": donation_data.donor_email,
                    "campaign_id": donation_data.campaign_id or "general"
                }
            })
            
            # Step 3: Store donation record
            donation = Donation(
                campaign_id=donation_data.campaign_id,
                amount=donation_data.amount,
                donor_name=donation_data.donor_name,
                donor_email=donation_data.donor_email,
                donor_phone=donation_data.donor_phone,
                donor_pan=donation_data.donor_pan,
                razorpay_subscription_id=subscription["id"],
                is_recurring=True,
                status="pending"
            )
            
            donation_dict = donation.model_dump()
            donation_dict["created_at"] = donation_dict["created_at"].isoformat()
            await db.donations.insert_one(donation_dict)
            
            return {
                "type": "subscription",
                "subscription_id": subscription["id"],
                "key_id": key_id,
                "amount": amount_in_paise,
                "donation_id": donation.id
            }
        except Exception as e:
            logger.error(f"Subscription creation error: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create subscription: {str(e)}")
    else:
        # --- ONE-TIME PAYMENT ---
        razorpay_order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": 1
        })
        
        donation = Donation(
            campaign_id=donation_data.campaign_id,
            amount=donation_data.amount,
            donor_name=donation_data.donor_name,
            donor_email=donation_data.donor_email,
            donor_phone=donation_data.donor_phone,
            donor_pan=donation_data.donor_pan,
            razorpay_order_id=razorpay_order["id"],
            is_recurring=False
        )
        
        donation_dict = donation.model_dump()
        donation_dict["created_at"] = donation_dict["created_at"].isoformat()
        await db.donations.insert_one(donation_dict)
        
        return {
            "type": "order",
            "order_id": razorpay_order["id"],
            "amount": amount_in_paise,
            "currency": "INR",
            "donation_id": donation.id,
            "key_id": key_id
        }

@api_router.post("/donations/verify")
async def verify_donation(data: dict):
    razorpay_order_id = data.get("razorpay_order_id")
    razorpay_payment_id = data.get("razorpay_payment_id")
    razorpay_signature = data.get("razorpay_signature")
    razorpay_subscription_id = data.get("razorpay_subscription_id")
    
    try:
        if razorpay_subscription_id:
            # Subscription payment verification
            razorpay_client.utility.verify_subscription_payment_signature({
                'razorpay_subscription_id': razorpay_subscription_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
            
            await db.donations.update_one(
                {"razorpay_subscription_id": razorpay_subscription_id},
                {"$set": {
                    "status": "active",
                    "razorpay_payment_id": razorpay_payment_id
                }}
            )
            
            donation = await db.donations.find_one({"razorpay_subscription_id": razorpay_subscription_id}, {"_id": 0})
            if donation and donation.get("campaign_id"):
                await db.campaigns.update_one(
                    {"id": donation["campaign_id"]},
                    {"$inc": {"raised_amount": donation["amount"]}}
                )
            
            return {"status": "success", "message": "Subscription activated successfully! Monthly auto-debit is now enabled."}
        else:
            # One-time order verification
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
            
            await db.donations.update_one(
                {"razorpay_order_id": razorpay_order_id},
                {"$set": {"status": "completed", "razorpay_payment_id": razorpay_payment_id}}
            )
            
            donation = await db.donations.find_one({"razorpay_order_id": razorpay_order_id}, {"_id": 0})
            if donation and donation.get("campaign_id"):
                await db.campaigns.update_one(
                    {"id": donation["campaign_id"]},
                    {"$inc": {"raised_amount": donation["amount"]}}
                )
            
            return {"status": "success", "message": "Payment verified successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payment verification failed: {str(e)}")

@api_router.get("/donations/user/{user_id}")
async def get_user_donations(user_id: str):
    donations = await db.donations.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    for donation in donations:
        if isinstance(donation.get('created_at'), str):
            donation['created_at'] = datetime.fromisoformat(donation['created_at'])
    return donations

# Blog Routes
@api_router.get("/blogs", response_model=List[Blog])
async def get_blogs():
    blogs = await db.blogs.find({"published": True}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for blog in blogs:
        if isinstance(blog.get('created_at'), str):
            blog['created_at'] = datetime.fromisoformat(blog['created_at'])
    return blogs

@api_router.post("/blogs", response_model=Blog)
async def create_blog(blog_data: BlogCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    slug_base = blog_data.title.lower().replace(" ", "-")
    slug = f"{slug_base}-{str(uuid.uuid4())[:8]}"
    
    blog = Blog(
        title=blog_data.title,
        slug=slug,
        content=blog_data.content,
        excerpt=blog_data.excerpt,
        image_url=blog_data.image_url,
        category=blog_data.category,
        tags=blog_data.tags,
        author=blog_data.author,
        published=True
    )
    
    blog_dict = blog.model_dump()
    blog_dict["created_at"] = blog_dict["created_at"].isoformat()
    
    await db.blogs.insert_one(blog_dict)
    return blog

@api_router.put("/blogs/{slug}", response_model=Blog)
async def update_blog(slug: str, blog_data: BlogCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    existing = await db.blogs.find_one({"slug": slug})
    if not existing:
        raise HTTPException(status_code=404, detail="Blog not found")
        
    update_data = {
        "title": blog_data.title,
        "content": blog_data.content,
        "excerpt": blog_data.excerpt,
        "image_url": blog_data.image_url,
        "category": blog_data.category,
        "tags": blog_data.tags,
        "author": blog_data.author
    }
    await db.blogs.update_one({"slug": slug}, {"$set": update_data})
    
    updated = await db.blogs.find_one({"slug": slug}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Blog(**updated)

@api_router.delete("/blogs/{slug}")
async def delete_blog(slug: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    result = await db.blogs.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")
    return {"status": "success", "message": "Blog deleted"}

@api_router.get("/blogs/{slug}", response_model=Blog)
async def get_blog(slug: str):
    blog = await db.blogs.find_one({"slug": slug}, {"_id": 0})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    if isinstance(blog.get('created_at'), str):
        blog['created_at'] = datetime.fromisoformat(blog['created_at'])
    return Blog(**blog)

# Volunteer Routes
@api_router.post("/volunteers", response_model=Volunteer)
async def create_volunteer(volunteer_data: VolunteerCreate):
    volunteer = Volunteer(
        name=volunteer_data.name,
        email=volunteer_data.email,
        phone=volunteer_data.phone,
        interest_area=volunteer_data.interest_area,
        message=volunteer_data.message
    )
    
    volunteer_dict = volunteer.model_dump()
    volunteer_dict["created_at"] = volunteer_dict["created_at"].isoformat()
    
    await db.volunteers.insert_one(volunteer_dict)
    return volunteer

# Team Routes
@api_router.get("/team", response_model=List[TeamMember])
async def get_team(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    team = await db.team.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    return team

# Gallery Routes
@api_router.get("/gallery", response_model=List[GalleryItem])
async def get_gallery(type: Optional[str] = None):
    query = {}
    if type:
        query["type"] = type
    gallery = await db.gallery.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    for item in gallery:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return gallery

@api_router.post("/gallery", response_model=GalleryItem)
async def create_gallery_item(item_data: GalleryItemCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    item = GalleryItem(
        title=item_data.title,
        type=item_data.type,
        url=item_data.url,
        thumbnail_url=item_data.thumbnail_url,
        category=item_data.category
    )
    item_dict = item.model_dump()
    item_dict["created_at"] = item_dict["created_at"].isoformat()
    await db.gallery.insert_one(item_dict)
    return item

@api_router.delete("/gallery/{item_id}")
async def delete_gallery_item(item_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    result = await db.gallery.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    return {"status": "success", "message": "Gallery item deleted"}

# Documents Routes
@api_router.get("/documents", response_model=List[Document])
async def get_documents(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    documents = await db.documents.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    for doc in documents:
        if isinstance(doc.get('created_at'), str):
            doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return documents

@api_router.post("/documents", response_model=Document)
async def create_document(doc_data: DocumentCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    doc = Document(
        title=doc_data.title,
        category=doc_data.category,
        file_url=doc_data.file_url
    )
    doc_dict = doc.model_dump()
    doc_dict["created_at"] = doc_dict["created_at"].isoformat()
    await db.documents.insert_one(doc_dict)
    return doc

@api_router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    result = await db.documents.delete_one({"id": doc_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"status": "success", "message": "Document deleted"}

# Admin: Volunteers list + approve/reject
@api_router.get("/admin/volunteers")
async def admin_list_volunteers(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    volunteers = await db.volunteers.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for v in volunteers:
        if isinstance(v.get('created_at'), str):
            v['created_at'] = datetime.fromisoformat(v['created_at'])
    return volunteers

@api_router.put("/admin/volunteers/{volunteer_id}/status")
async def update_volunteer_status(volunteer_id: str, data: dict, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    new_status = data.get("status", "pending")
    result = await db.volunteers.update_one({"id": volunteer_id}, {"$set": {"status": new_status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    return {"status": "success", "message": f"Volunteer status updated to {new_status}"}

# Admin: Donations list
@api_router.get("/admin/donations")
async def admin_list_donations(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    donations = await db.donations.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for d in donations:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
    return donations

# Admin: Users list + role update
@api_router.get("/admin/users")
async def admin_list_users(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    users = await db.users.find({}, {"_id": 0, "hashed_password": 0}).sort("created_at", -1).to_list(500)
    for u in users:
        if isinstance(u.get('created_at'), str):
            u['created_at'] = datetime.fromisoformat(u['created_at'])
    return users

@api_router.put("/admin/users/{user_id}/role")
async def update_user_role(user_id: str, data: dict, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    new_role = data.get("role", "donor")
    result = await db.users.update_one({"id": user_id}, {"$set": {"role": new_role}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "success", "message": f"Role updated to {new_role}"}

# Admin: Dashboard stats (comprehensive)
@api_router.get("/admin/stats")
async def admin_stats(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    campaigns = await db.campaigns.find({}, {"_id": 0}).to_list(1000)
    total_funds = sum(c.get("raised_amount", 0) for c in campaigns)
    total_beneficiaries = sum(c.get("beneficiaries_count", 0) for c in campaigns)
    active_campaigns = len([c for c in campaigns if c.get("status") == "active"])
    volunteers_count = await db.volunteers.count_documents({})
    approved_volunteers = await db.volunteers.count_documents({"status": "approved"})
    donations_count = await db.donations.count_documents({"status": "completed"})
    blogs_count = await db.blogs.count_documents({})
    users_count = await db.users.count_documents({})
    gallery_count = await db.gallery.count_documents({})
    documents_count = await db.documents.count_documents({})
    
    return {
        "total_funds_raised": total_funds,
        "total_beneficiaries": total_beneficiaries,
        "active_campaigns": active_campaigns,
        "total_campaigns": len(campaigns),
        "total_volunteers": volunteers_count,
        "approved_volunteers": approved_volunteers,
        "total_donations": donations_count,
        "total_blogs": blogs_count,
        "total_users": users_count,
        "total_gallery": gallery_count,
        "total_documents": documents_count
    }

# Impact Stats (public)
@api_router.get("/stats", response_model=ImpactStats)
async def get_stats():
    campaigns = await db.campaigns.find({}, {"_id": 0}).to_list(1000)
    total_funds = sum(c.get("raised_amount", 0) for c in campaigns)
    total_beneficiaries = sum(c.get("beneficiaries_count", 0) for c in campaigns)
    active_campaigns = len([c for c in campaigns if c.get("status") == "active"])
    volunteers_count = await db.volunteers.count_documents({"status": "approved"})
    
    return ImpactStats(
        total_beneficiaries=total_beneficiaries,
        total_funds_raised=total_funds,
        active_campaigns=active_campaigns,
        volunteers=volunteers_count
    )

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
