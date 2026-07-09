import asyncio
import os
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'charity_db')

async def seed_data():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    print("Seeding Top Donors...")
    top_donors = [
        {
            "id": str(uuid.uuid4()),
            "campaign_id": None,
            "amount": 25000.0,
            "tip_amount": 1000.0,
            "donor_name": "Rajesh Kumar",
            "donor_email": "rajesh.k@example.com",
            "donor_phone": "9876543210",
            "is_recurring": True,
            "duration_months": 12,
            "is_anonymous": False,
            "status": "completed",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "campaign_id": None,
            "amount": 15000.0,
            "tip_amount": 500.0,
            "donor_name": "Priya Sharma",
            "donor_email": "priya.s@example.com",
            "donor_phone": "9812345678",
            "is_recurring": False,
            "is_anonymous": False,
            "status": "completed",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "campaign_id": None,
            "amount": 10000.0,
            "tip_amount": 0.0,
            "donor_name": "Anonymous Donor",
            "donor_email": "anon@example.com",
            "donor_phone": "9999999999",
            "is_recurring": True,
            "duration_months": 24,
            "is_anonymous": True,
            "status": "completed",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "campaign_id": None,
            "amount": 7500.0,
            "tip_amount": 350.0,
            "donor_name": "Amitav Roy",
            "donor_email": "amitav.roy@example.com",
            "donor_phone": "9823456789",
            "is_recurring": False,
            "is_anonymous": False,
            "status": "completed",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    for d in top_donors:
        existing = await db.donations.find_one({"donor_email": d["donor_email"], "amount": d["amount"]})
        if not existing:
            await db.donations.insert_one(d)

    print("Seeding Activities...")
    activities = [
        {
            "id": str(uuid.uuid4()),
            "title": "Rural Education Drive 2026",
            "description": "Distributed learning kits, textbooks, and smart tablets to over 500 children across 12 village primary schools.",
            "category": "Education",
            "media_type": "image",
            "media_url": "https://images.pexels.com/photos/18012463/pexels-photo-18012463.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "gallery_urls": [
                "https://images.pexels.com/photos/18012458/pexels-photo-18012458.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "https://images.pexels.com/photos/7692546/pexels-photo-7692546.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            ],
            "event_date": "2026-05-15",
            "location": "Nashik District, Maharashtra",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Mobile Healthcare & Eye Checkup Camp",
            "description": "Free diagnostic medical checkups, eye testing, and medicines provided for elderly residents in underserved communities.",
            "category": "Healthcare",
            "media_type": "image",
            "media_url": "https://images.pexels.com/photos/7579824/pexels-photo-7579824.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "gallery_urls": [
                "https://images.pexels.com/photos/7579824/pexels-photo-7579824.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            ],
            "event_date": "2026-06-02",
            "location": "Thane Rural, Maharashtra",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Women Empowerment & Artisans Skill Workshop",
            "description": "Trained 80 women in handicraft making, tailoring, and micro-business management to achieve financial independence.",
            "category": "Women Empowerment",
            "media_type": "image",
            "media_url": "https://images.unsplash.com/photo-1723564211731-21ceb97443a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21lbiUyMHNlbGYlMjBoZWxwJTIwZ3JvdXAlMjBtZWV0aW5nfGVufDB8fHx8MTc3MTU4MDEyN3ww&ixlib=rb-4.1.0&q=85",
            "gallery_urls": [],
            "event_date": "2026-06-20",
            "location": "Pune District, Maharashtra",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    for a in activities:
        existing = await db.activities.find_one({"title": a["title"]})
        if not existing:
            await db.activities.insert_one(a)

    print("Seeding Stories...")
    stories = [
        {
            "id": str(uuid.uuid4()),
            "title": "From Village Classroom to Engineering College: Sunita's Journey",
            "description": "Sunita, born in a small agricultural hamlet, was determined to pursue higher education despite severe financial constraints. Through Charitage Foundation's Higher Education Scholarship Initiative, she received full tuition assistance, mentorship, and learning resources. Today, she is in her final year of Computer Engineering and mentoring younger girls in her native village.",
            "featured_image": "https://images.pexels.com/photos/18012463/pexels-photo-18012463.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "category": "Scholarship",
            "author": "Charitage Editorial Team",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Restoring Sight and Hope: Ramesh's Cataract Surgery Story",
            "description": "65-year-old farmer Ramesh lost his sight due to bilateral cataracts, preventing him from tending to his fields. Through Charitage Foundation's Free Vision Camp, he underwent successful surgery. 'I can see the sunrise clearly again,' he says with a smile.",
            "featured_image": "https://images.pexels.com/photos/7579824/pexels-photo-7579824.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "category": "Healthcare Impact",
            "author": "Dr. Ananya Verma",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    for s in stories:
        existing = await db.stories.find_one({"title": s["title"]})
        if not existing:
            await db.stories.insert_one(s)

    print("Seeding News...")
    news_items = [
        {
            "id": str(uuid.uuid4()),
            "title": "Charitage Foundation Recognized for 100% Transparent Philanthropy Model",
            "content": "Charitage Foundation has been honored at the National Social Innovation Summit for maintaining 0% platform fees and complete financial transparency. Over 98% of direct contributions go straight to ground initiatives.",
            "excerpt": "Charitage Foundation awarded top honors for transparent grassroots social impact.",
            "image_url": "https://images.pexels.com/photos/15597025/pexels-photo-15597025.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "video_url": None,
            "category": "Recognition",
            "tags": ["Award", "Transparency", "Impact"],
            "author": "Media Desk",
            "published_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Launch of New Clean Water Initiative in 15 Remote Hamlets",
            "content": "In partnership with local village panchayats, Charitage Foundation has commissioned solar-powered water filtration units providing clean drinking water to over 3,000 households.",
            "excerpt": "Solar water purification plants deployed across rural hamlets.",
            "image_url": "https://images.pexels.com/photos/7692546/pexels-photo-7692546.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "video_url": None,
            "category": "Initiatives",
            "tags": ["CleanWater", "Sustainability", "Community"],
            "author": "CSR Desk",
            "published_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    for n in news_items:
        existing = await db.news.find_one({"title": n["title"]})
        if not existing:
            await db.news.insert_one(n)

    client.close()
    print("Seed complete successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
