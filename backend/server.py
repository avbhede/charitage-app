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
import re
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

# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    client.close()

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
    role: Optional[str] = "donor"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class Campaign(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str
    goal_amount: float
    raised_amount: float = 0.0
    image_url: str
    status: str = "active"  # "active", "pending", "completed"
    beneficiaries_count: int = 0
    submitted_by: Optional[str] = None
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
    submitted_by: Optional[str] = None

class Donation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    campaign_id: Optional[str] = None
    amount: float
    tip_amount: float = 0.0
    donor_name: str
    donor_email: EmailStr
    donor_phone: str
    donor_pan: Optional[str] = None
    is_recurring: bool = False
    duration_months: int = 12
    gift_address: Optional[str] = None
    is_anonymous: bool = False
    razorpay_order_id: str = ""
    razorpay_payment_id: Optional[str] = None
    razorpay_subscription_id: Optional[str] = None
    status: str = "pending"
    receipt_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DonationCreate(BaseModel):
    campaign_id: Optional[str] = None
    amount: float
    tip_amount: float = 0.0
    donor_name: str
    donor_email: EmailStr
    donor_phone: str
    donor_pan: Optional[str] = None
    is_recurring: bool = False
    duration_months: int = 12
    gift_address: Optional[str] = None
    is_anonymous: bool = False

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
    date_of_birth: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    id_proof_type: Optional[str] = None
    aadhaar_number: Optional[str] = None
    city: Optional[str] = None
    photo_url: Optional[str] = None
    interest_area: str
    message: str
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VolunteerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    date_of_birth: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    id_proof_type: Optional[str] = None
    aadhaar_number: Optional[str] = None
    city: Optional[str] = None
    photo_url: Optional[str] = None
    address: Optional[str] = None
    interest_area: str
    message: str
    registration_type: str = "volunteer"

class FoundationMemberCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    aadhaar_card: str
    membership_plan: str  # "annual", "5_years", "10_years"
    plan_fee: float
    age: int
    address: Optional[str] = None

class FoundationMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    aadhaar_card: str
    membership_plan: str
    plan_fee: float
    age: int
    address: Optional[str] = None
    status: str = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InquiryCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    company_name: Optional[str] = None
    area_of_interest: str
    message: str

class Inquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    company_name: Optional[str] = None
    area_of_interest: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Activity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str
    media_type: str = "image"  # "image" or "video"
    media_url: str
    gallery_urls: List[str] = []
    event_date: Optional[str] = None
    location: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ActivityCreate(BaseModel):
    title: str
    description: str
    category: str
    media_type: str = "image"
    media_url: str
    gallery_urls: List[str] = []
    event_date: Optional[str] = None
    location: Optional[str] = None

class Story(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    featured_image: str
    category: str = "Impact Story"
    author: str = "Charitage Team"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StoryCreate(BaseModel):
    title: str
    description: str
    featured_image: str
    category: str = "Impact Story"
    author: str = "Charitage Team"

class NewsItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    excerpt: str
    image_url: str
    video_url: Optional[str] = None
    category: str
    tags: List[str] = []
    author: str = "Charitage News Desk"
    published_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NewsItemCreate(BaseModel):
    title: str
    content: str
    excerpt: str
    image_url: str
    video_url: Optional[str] = None
    category: str
    tags: List[str] = []
    author: str = "Charitage News Desk"

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

class GalleryItemCreate(BaseModel):
    title: str
    type: str
    url: str
    thumbnail_url: Optional[str] = None
    category: str

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

# Helpers
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

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
        pan=user_data.pan,
        role=user_data.role or "donor"
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

@api_router.post("/auth/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    user = await db.users.find_one({"email": req.email})
    if not user:
        # For security, return friendly response even if email not registered
        return {"status": "success", "message": "If an account exists for this email, password reset instructions have been sent."}
    
    # Store token in DB
    reset_token = str(uuid.uuid4())
    await db.password_resets.insert_one({
        "email": req.email,
        "token": reset_token,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "status": "success", 
        "message": f"Password reset link has been dispatched to {req.email}. (Demo Reset Token: {reset_token})"
    }

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
        beneficiaries_count=campaign_data.beneficiaries_count,
        status=campaign_data.status or "active"
    )
    
    campaign_dict = campaign.model_dump()
    campaign_dict["created_at"] = campaign_dict["created_at"].isoformat()
    
    await db.campaigns.insert_one(campaign_dict)
    return campaign

@api_router.post("/fundseekers/campaigns")
async def submit_fundseeker_campaign(campaign_data: CampaignCreate, current_user: User = Depends(get_current_user)):
    """Fund Seekers can submit campaign proposals requiring admin approval before publishing"""
    campaign = Campaign(
        title=campaign_data.title,
        description=campaign_data.description,
        category=campaign_data.category,
        goal_amount=campaign_data.goal_amount,
        image_url=campaign_data.image_url,
        beneficiaries_count=campaign_data.beneficiaries_count,
        status="pending",
        submitted_by=current_user.email
    )
    
    campaign_dict = campaign.model_dump()
    campaign_dict["created_at"] = campaign_dict["created_at"].isoformat()
    
    await db.campaigns.insert_one(campaign_dict)
    return {"status": "success", "message": "Campaign submitted for admin review and approval!", "campaign": campaign}

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
        "beneficiaries_count": campaign_data.beneficiaries_count,
        "status": campaign_data.status
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
    return {
        "razorpay_key_id": os.environ.get('RAZORPAY_KEY_ID', '')
    }

@api_router.post("/donations/create-order")
async def create_donation_order(donation_data: DonationCreate):
    total_amount = donation_data.amount + (donation_data.tip_amount or 0.0)
    amount_in_paise = int(total_amount * 100)
    key_id = os.environ.get('RAZORPAY_KEY_ID', '')
    
    if donation_data.is_recurring:
        try:
            plan = razorpay_client.plan.create({
                "period": "monthly",
                "interval": 1,
                "item": {
                    "name": f"Monthly Donation - Charitage Foundation",
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "description": f"Monthly SIP donation of Rs.{donation_data.amount}" + (f" + Rs.{donation_data.tip_amount} tip" if donation_data.tip_amount else "")
                }
            })
            
            subscription = razorpay_client.subscription.create({
                "plan_id": plan["id"],
                "total_count": 1200,
                "quantity": 1,
                "customer_notify": 1,
                "notes": {
                    "donor_name": donation_data.donor_name,
                    "donor_email": donation_data.donor_email,
                    "campaign_id": donation_data.campaign_id or "general"
                }
            })
            
            donation = Donation(
                campaign_id=donation_data.campaign_id,
                amount=donation_data.amount,
                tip_amount=donation_data.tip_amount or 0.0,
                donor_name=donation_data.donor_name,
                donor_email=donation_data.donor_email,
                donor_phone=donation_data.donor_phone,
                donor_pan=donation_data.donor_pan,
                is_recurring=True,
                duration_months=donation_data.duration_months or 12,
                gift_address=donation_data.gift_address,
                is_anonymous=donation_data.is_anonymous,
                razorpay_subscription_id=subscription["id"],
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
            logging.error(f"Subscription creation error: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create subscription: {str(e)}")
    else:
        try:
            razorpay_order = razorpay_client.order.create({
                "amount": amount_in_paise,
                "currency": "INR",
                "payment_capture": 1
            })
            
            donation = Donation(
                campaign_id=donation_data.campaign_id,
                amount=donation_data.amount,
                tip_amount=donation_data.tip_amount or 0.0,
                donor_name=donation_data.donor_name,
                donor_email=donation_data.donor_email,
                donor_phone=donation_data.donor_phone,
                donor_pan=donation_data.donor_pan,
                is_recurring=False,
                gift_address=donation_data.gift_address,
                is_anonymous=donation_data.is_anonymous,
                razorpay_order_id=razorpay_order["id"],
                status="pending"
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
        except Exception as e:
            logging.error(f"Order creation error: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@api_router.post("/donations/verify")
async def verify_donation(data: dict):
    razorpay_order_id = data.get("razorpay_order_id")
    razorpay_payment_id = data.get("razorpay_payment_id")
    razorpay_signature = data.get("razorpay_signature")
    razorpay_subscription_id = data.get("razorpay_subscription_id")
    
    try:
        if razorpay_subscription_id:
            razorpay_client.utility.verify_subscription_payment_signature({
                'razorpay_subscription_id': razorpay_subscription_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
            
            await db.donations.update_one(
                {"razorpay_subscription_id": razorpay_subscription_id},
                {"$set": {
                    "status": "completed",
                    "razorpay_payment_id": razorpay_payment_id
                }}
            )
            
            donation = await db.donations.find_one({"razorpay_subscription_id": razorpay_subscription_id}, {"_id": 0})
            if donation and donation.get("campaign_id"):
                await db.campaigns.update_one(
                    {"id": donation["campaign_id"]},
                    {"$inc": {"raised_amount": donation["amount"]}}
                )
            
            return {
                "status": "success", 
                "message": "Monthly donation activated successfully! Receipt generated.",
                "donation_id": donation.get("id") if donation else None
            }
        else:
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
            
            return {
                "status": "success", 
                "message": "Payment verified successfully! Donation receipt generated.",
                "donation_id": donation.get("id") if donation else None
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payment verification failed: {str(e)}")

@api_router.get("/donations/top-donors")
async def get_top_donors():
    """Returns top donors who donated ₹5,000 or above (handling anonymous donors)"""
    donations = await db.donations.find(
        {"amount": {"$gte": 5000}, "status": "completed"}, 
        {"_id": 0}
    ).sort("amount", -1).to_list(20)
    
    top_donors = []
    for d in donations:
        campaign_title = "General Donation"
        if d.get("campaign_id"):
            c = await db.campaigns.find_one({"id": d["campaign_id"]}, {"_id": 0, "title": 1})
            if c:
                campaign_title = c.get("title", "General Donation")
        
        display_name = "Anonymous Donor" if d.get("is_anonymous") else d.get("donor_name", "Anonymous")
        top_donors.append({
            "id": d.get("id"),
            "donor_name": display_name,
            "amount": d.get("amount"),
            "is_recurring": d.get("is_recurring", False),
            "campaign_title": campaign_title,
            "created_at": d.get("created_at")
        })
    
    return top_donors

@api_router.get("/donations/receipt/{donation_id}")
async def get_donation_receipt(donation_id: str):
    """Generates digital receipt details for a completed donation"""
    donation = await db.donations.find_one({"id": donation_id}, {"_id": 0})
    if not donation:
        raise HTTPException(status_code=404, detail="Donation record not found")
    
    campaign_title = "Direct Foundation Support"
    if donation.get("campaign_id"):
        c = await db.campaigns.find_one({"id": donation["campaign_id"]})
        if c:
            campaign_title = c.get("title", campaign_title)
            
    receipt_data = {
        "receipt_number": f"REC-{datetime.now().strftime('%Y%m%d')}-{donation_id[:6].upper()}",
        "date": donation.get("created_at"),
        "donor_name": donation.get("donor_name"),
        "donor_email": donation.get("donor_email"),
        "donor_phone": donation.get("donor_phone"),
        "donor_pan": donation.get("donor_pan") or "N/A",
        "amount": donation.get("amount"),
        "tip_amount": donation.get("tip_amount", 0.0),
        "total_paid": donation.get("amount", 0.0) + donation.get("tip_amount", 0.0),
        "is_recurring": donation.get("is_recurring", False),
        "duration_months": donation.get("duration_months", 12),
        "payment_id": donation.get("razorpay_payment_id") or donation.get("razorpay_order_id") or "PAY-SUCCESS",
        "campaign_title": campaign_title,
        "foundation_name": "Charitage Foundation",
        "reg_no": "12A / 80G Tax Exempt: AAATC1234F20231",
        "address": "Plot 42, Service Road, BKC, Mumbai, MS 400051",
        "gift_address": donation.get("gift_address")
    }
    return receipt_data

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
    # Registered users with appropriate session can create/publish blogs
    slug_base = blog_data.title.lower().replace(" ", "-")
    slug_base = re.sub(r'[^a-z0-9-]', '', slug_base)
    slug = f"{slug_base}-{str(uuid.uuid4())[:6]}"
    
    blog = Blog(
        title=blog_data.title,
        slug=slug,
        content=blog_data.content,
        excerpt=blog_data.excerpt,
        image_url=blog_data.image_url,
        category=blog_data.category,
        tags=blog_data.tags,
        author=blog_data.author or current_user.name,
        published=True
    )
    
    blog_dict = blog.model_dump()
    blog_dict["created_at"] = blog_dict["created_at"].isoformat()
    
    await db.blogs.insert_one(blog_dict)
    return blog

@api_router.get("/blogs/{slug}", response_model=Blog)
async def get_blog(slug: str):
    blog = await db.blogs.find_one({"slug": slug}, {"_id": 0})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    if isinstance(blog.get('created_at'), str):
        blog['created_at'] = datetime.fromisoformat(blog['created_at'])
    return Blog(**blog)

# Activities Module Routes
@api_router.get("/activities", response_model=List[Activity])
async def get_activities(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    activities = await db.activities.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    for item in activities:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return activities

@api_router.get("/activities/{activity_id}", response_model=Activity)
async def get_activity(activity_id: str):
    act = await db.activities.find_one({"id": activity_id}, {"_id": 0})
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
    if isinstance(act.get('created_at'), str):
        act['created_at'] = datetime.fromisoformat(act['created_at'])
    return Activity(**act)

@api_router.post("/activities", response_model=Activity)
async def create_activity(act_data: ActivityCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    activity = Activity(
        title=act_data.title,
        description=act_data.description,
        category=act_data.category,
        media_type=act_data.media_type,
        media_url=act_data.media_url,
        gallery_urls=act_data.gallery_urls,
        event_date=act_data.event_date,
        location=act_data.location
    )
    act_dict = activity.model_dump()
    act_dict["created_at"] = act_dict["created_at"].isoformat()
    await db.activities.insert_one(act_dict)
    return activity

@api_router.delete("/activities/{activity_id}")
async def delete_activity(activity_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    res = await db.activities.delete_one({"id": activity_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"status": "success", "message": "Activity deleted"}

# Stories Module Routes
@api_router.get("/stories", response_model=List[Story])
async def get_stories():
    stories = await db.stories.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for story in stories:
        if isinstance(story.get('created_at'), str):
            story['created_at'] = datetime.fromisoformat(story['created_at'])
    return stories

@api_router.get("/stories/{story_id}", response_model=Story)
async def get_story(story_id: str):
    story = await db.stories.find_one({"id": story_id}, {"_id": 0})
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    if isinstance(story.get('created_at'), str):
        story['created_at'] = datetime.fromisoformat(story['created_at'])
    return Story(**story)

@api_router.post("/stories", response_model=Story)
async def create_story(story_data: StoryCreate, current_user: User = Depends(get_current_user)):
    story = Story(
        title=story_data.title,
        description=story_data.description,
        featured_image=story_data.featured_image,
        category=story_data.category,
        author=story_data.author
    )
    story_dict = story.model_dump()
    story_dict["created_at"] = story_dict["created_at"].isoformat()
    await db.stories.insert_one(story_dict)
    return story

# News Module Routes
@api_router.get("/news", response_model=List[NewsItem])
async def get_news():
    news_list = await db.news.find({}, {"_id": 0}).sort("published_at", -1).to_list(100)
    for item in news_list:
        if isinstance(item.get('published_at'), str):
            item['published_at'] = datetime.fromisoformat(item['published_at'])
    return news_list

@api_router.get("/news/{news_id}", response_model=NewsItem)
async def get_news_item(news_id: str):
    item = await db.news.find_one({"id": news_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="News article not found")
    if isinstance(item.get('published_at'), str):
        item['published_at'] = datetime.fromisoformat(item['published_at'])
    return NewsItem(**item)

@api_router.post("/news", response_model=NewsItem)
async def create_news(news_data: NewsItemCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    news = NewsItem(
        title=news_data.title,
        content=news_data.content,
        excerpt=news_data.excerpt,
        image_url=news_data.image_url,
        video_url=news_data.video_url,
        category=news_data.category,
        tags=news_data.tags,
        author=news_data.author
    )
    news_dict = news.model_dump()
    news_dict["published_at"] = news_dict["published_at"].isoformat()
    await db.news.insert_one(news_dict)
    return news

# Registration & Inquiries Routes
@api_router.post("/volunteers", response_model=Volunteer)
async def create_volunteer(volunteer_data: VolunteerCreate):
    volunteer = Volunteer(
        name=volunteer_data.name,
        email=volunteer_data.email,
        phone=volunteer_data.phone,
        date_of_birth=volunteer_data.date_of_birth,
        age=volunteer_data.age,
        gender=volunteer_data.gender,
        id_proof_type=volunteer_data.id_proof_type,
        aadhaar_number=volunteer_data.aadhaar_number,
        city=volunteer_data.city,
        photo_url=volunteer_data.photo_url,
        interest_area=volunteer_data.interest_area,
        message=volunteer_data.message
    )
    
    volunteer_dict = volunteer.model_dump()
    volunteer_dict["created_at"] = volunteer_dict["created_at"].isoformat()
    await db.volunteers.insert_one(volunteer_dict)
    return volunteer

@api_router.post("/inquiries", response_model=Inquiry)
async def create_inquiry(inquiry_data: InquiryCreate):
    inquiry = Inquiry(
        name=inquiry_data.name,
        email=inquiry_data.email,
        phone=inquiry_data.phone,
        company_name=inquiry_data.company_name,
        area_of_interest=inquiry_data.area_of_interest,
        message=inquiry_data.message
    )
    inquiry_dict = inquiry.model_dump()
    inquiry_dict["created_at"] = inquiry_dict["created_at"].isoformat()
    await db.inquiries.insert_one(inquiry_dict)
    return inquiry

@api_router.post("/memberships", response_model=FoundationMember)
async def create_membership(member_data: FoundationMemberCreate):
    if member_data.age < 18:
        raise HTTPException(status_code=400, detail="Foundation Members must be at least 18 years of age.")
        
    member = FoundationMember(
        name=member_data.name,
        email=member_data.email,
        phone=member_data.phone,
        aadhaar_card=member_data.aadhaar_card,
        membership_plan=member_data.membership_plan,
        plan_fee=member_data.plan_fee,
        age=member_data.age,
        address=member_data.address
    )
    m_dict = member.model_dump()
    m_dict["created_at"] = m_dict["created_at"].isoformat()
    await db.memberships.insert_one(m_dict)
    return member

# Team & Documents Routes
@api_router.get("/team", response_model=List[TeamMember])
async def get_team(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    team = await db.team.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    return team

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

# Admin endpoints
@api_router.get("/admin/volunteers")
async def admin_list_volunteers(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    volunteers = await db.volunteers.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for v in volunteers:
        if isinstance(v.get('created_at'), str):
            v['created_at'] = datetime.fromisoformat(v['created_at'])
    return volunteers

@api_router.get("/admin/donations")
async def admin_list_donations(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    donations = await db.donations.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for d in donations:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
    return donations

@api_router.get("/admin/users")
async def admin_list_users(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    users = await db.users.find({}, {"_id": 0, "hashed_password": 0}).sort("created_at", -1).to_list(500)
    for u in users:
        if isinstance(u.get('created_at'), str):
            u['created_at'] = datetime.fromisoformat(u['created_at'])
    return users

@api_router.get("/admin/memberships")
async def admin_list_memberships(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    memberships = await db.memberships.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for m in memberships:
        if isinstance(m.get('created_at'), str):
            m['created_at'] = datetime.fromisoformat(m['created_at'])
    return memberships

@api_router.put("/admin/memberships/{member_id}/status")
async def admin_update_membership_status(member_id: str, payload: dict, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    status = payload.get("status", "approved")
    res = await db.memberships.update_one({"id": member_id}, {"$set": {"status": status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Membership application not found")
    return {"status": "success", "message": f"Membership {status}"}

@api_router.get("/admin/inquiries")
async def admin_list_inquiries(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    inquiries = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for inq in inquiries:
        if isinstance(inq.get('created_at'), str):
            inq['created_at'] = datetime.fromisoformat(inq['created_at'])
    return inquiries

@api_router.put("/admin/inquiries/{inquiry_id}/status")
async def admin_update_inquiry_status(inquiry_id: str, payload: dict, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    status = payload.get("status", "reviewed")
    res = await db.inquiries.update_one({"id": inquiry_id}, {"$set": {"status": status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return {"status": "success", "message": f"Inquiry status updated to {status}"}

@api_router.get("/admin/fundseekers")
async def admin_list_fundseekers(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    campaigns = await db.campaigns.find({"is_user_submitted": True}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for c in campaigns:
        if isinstance(c.get('created_at'), str):
            c['created_at'] = datetime.fromisoformat(c['created_at'])
    return campaigns

@api_router.post("/admin/fundseekers/{campaign_id}/approve")
async def admin_approve_fundseeker(campaign_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    res = await db.campaigns.update_one({"id": campaign_id}, {"$set": {"status": "active", "admin_reviewed": True}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Campaign proposal not found")
    return {"status": "success", "message": "Campaign approved and published live on website!"}

@api_router.post("/admin/fundseekers/{campaign_id}/reject")
async def admin_reject_fundseeker(campaign_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    res = await db.campaigns.update_one({"id": campaign_id}, {"$set": {"status": "rejected", "admin_reviewed": True}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Campaign proposal not found")
    return {"status": "success", "message": "Campaign proposal rejected."}

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
    memberships_count = await db.memberships.count_documents({})
    inquiries_count = await db.inquiries.count_documents({})
    pending_fundseekers = await db.campaigns.count_documents({"is_user_submitted": True, "status": "pending"})
    donations_count = await db.donations.count_documents({"status": "completed"})
    blogs_count = await db.blogs.count_documents({})
    users_count = await db.users.count_documents({})
    
    return {
        "total_funds_raised": total_funds,
        "total_beneficiaries": total_beneficiaries,
        "active_campaigns": active_campaigns,
        "total_campaigns": len(campaigns),
        "total_volunteers": volunteers_count,
        "approved_volunteers": approved_volunteers,
        "total_memberships": memberships_count,
        "total_inquiries": inquiries_count,
        "pending_fundseekers": pending_fundseekers,
        "total_donations": donations_count,
        "total_blogs": blogs_count,
        "total_users": users_count
    }

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
