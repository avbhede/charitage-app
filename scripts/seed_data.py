import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / 'backend' / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_data():
    print("Seeding database...")
    
    # Clear existing data
    await db.campaigns.delete_many({})
    await db.blogs.delete_many({})
    await db.team.delete_many({})
    await db.gallery.delete_many({})
    await db.documents.delete_many({})
    
    # Seed Campaigns
    campaigns = [
        {
            "id": "camp-001",
            "title": "Education for Rural Children",
            "description": "Provide quality education and learning materials to children in rural areas. Help us build libraries and provide scholarships for underprivileged students.",
            "category": "Education",
            "goal_amount": 500000,
            "raised_amount": 325000,
            "image_url": "https://images.pexels.com/photos/18012463/pexels-photo-18012463.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "status": "active",
            "beneficiaries_count": 500,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "camp-002",
            "title": "Mobile Healthcare Clinics",
            "description": "Bring healthcare to remote villages through mobile medical clinics. Provide free checkups, medicines, and health awareness programs.",
            "category": "Healthcare",
            "goal_amount": 800000,
            "raised_amount": 450000,
            "image_url": "https://images.pexels.com/photos/7579824/pexels-photo-7579824.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "status": "active",
            "beneficiaries_count": 1200,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "camp-003",
            "title": "Women's Skill Development",
            "description": "Empower women through vocational training in tailoring, handicrafts, and entrepreneurship. Create sustainable livelihoods for rural women.",
            "category": "Women Empowerment",
            "goal_amount": 300000,
            "raised_amount": 180000,
            "image_url": "https://images.unsplash.com/photo-1723564211731-21ceb97443a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21lbiUyMHNlbGYlMjBoZWxwJTIwZ3JvdXAlMjBtZWV0aW5nfGVufDB8fHx8MTc3MTU4MDEyN3ww&ixlib=rb-4.1.0&q=85",
            "status": "active",
            "beneficiaries_count": 300,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "camp-004",
            "title": "Clean Water Initiative",
            "description": "Install water purification systems and hand pumps in villages lacking access to clean drinking water.",
            "category": "Rural Development",
            "goal_amount": 600000,
            "raised_amount": 600000,
            "image_url": "https://images.pexels.com/photos/15597025/pexels-photo-15597025.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "status": "completed",
            "beneficiaries_count": 2000,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.campaigns.insert_many(campaigns)
    print(f"Seeded {len(campaigns)} campaigns")
    
    # Seed Blogs
    blogs = [
        {
            "id": "blog-001",
            "title": "Transforming Lives Through Education: A Success Story",
            "slug": "transforming-lives-through-education",
            "content": "In the heart of rural Maharashtra, we witnessed a remarkable transformation. What started as a small initiative to provide books to 50 children has now grown into a full-fledged education program serving over 500 students.\n\nThe journey began when we identified a village where children were walking 5 kilometers daily to attend a dilapidated school with no proper infrastructure. Today, that same school has a library, computer lab, and qualified teachers.\n\nMeet Priya, a 14-year-old who dreamed of becoming a doctor. Thanks to our scholarship program, she's now excelling in her studies and is on track to achieve her dreams. Stories like Priya's motivate us to continue our mission.\n\nWe believe education is the foundation for breaking the cycle of poverty. Every child deserves access to quality education, regardless of their background or economic status.",
            "excerpt": "How a small education initiative transformed into a movement impacting 500+ children in rural Maharashtra",
            "image_url": "https://images.pexels.com/photos/18012458/pexels-photo-18012458.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "category": "Impact Stories",
            "tags": ["Education", "Rural Development", "Success Story"],
            "author": "Anjali Sharma",
            "published": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "blog-002",
            "title": "Healthcare Access: Bridging the Gap in Rural India",
            "slug": "healthcare-access-bridging-the-gap",
            "content": "Access to basic healthcare remains a challenge for millions in rural India. Our mobile health clinic initiative is changing this narrative, one village at a time.\n\nLaunched six months ago, our mobile clinics have already served over 1,200 patients across 15 villages. Equipped with basic diagnostic tools and medicines, these clinics bring healthcare directly to those who need it most.\n\nDr. Ramesh, who leads our medical team, shares: 'Many patients we see have never visited a doctor before. Simple conditions that could be easily treated often become serious due to lack of access.'\n\nOur preventive care approach includes health awareness camps, vaccination drives, and regular checkups. We're not just treating illnesses; we're building healthier communities.",
            "excerpt": "Our mobile health clinics are bringing essential healthcare services to underserved rural communities",
            "image_url": "https://images.pexels.com/photos/7579824/pexels-photo-7579824.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "category": "Programs",
            "tags": ["Healthcare", "Mobile Clinics", "Rural Health"],
            "author": "Dr. Vikram Patel",
            "published": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.blogs.insert_many(blogs)
    print(f"Seeded {len(blogs)} blogs")
    
    # Seed Gallery
    gallery = [
        {
            "id": "gal-001",
            "title": "Students at village school",
            "type": "photo",
            "url": "https://images.pexels.com/photos/18012463/pexels-photo-18012463.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "category": "Education",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "gal-002",
            "title": "Mobile health clinic in action",
            "type": "photo",
            "url": "https://images.pexels.com/photos/7579824/pexels-photo-7579824.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "category": "Healthcare",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "gal-003",
            "title": "Volunteer teaching session",
            "type": "photo",
            "url": "https://images.pexels.com/photos/7692546/pexels-photo-7692546.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "category": "Volunteers",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "gal-004",
            "title": "Women's empowerment workshop",
            "type": "photo",
            "url": "https://images.unsplash.com/photo-1723564211731-21ceb97443a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21lbiUyMHNlbGYlMjBoZWxwJTIwZ3JvdXAlMjBtZWV0aW5nfGVufDB8fHx8MTc3MTU4MDEyN3ww&ixlib=rb-4.1.0&q=85",
            "category": "Women Empowerment",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.gallery.insert_many(gallery)
    print(f"Seeded {len(gallery)} gallery items")
    
    print("Database seeding completed!")

if __name__ == "__main__":
    asyncio.run(seed_data())
