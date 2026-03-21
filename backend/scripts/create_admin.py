import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import uuid
from datetime import datetime, timezone
import argparse

# Use same env and logic as backend
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_password_hash(password):
    return pwd_context.hash(password)

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--email", default="admin@charitage.local")
    parser.add_argument("--password", default="adminpass")
    parser.add_argument("--name", default="Admin Master")
    args = parser.parse_args()

    mongo_url = "mongodb://localhost:27017" # Since this runs locally
    client = AsyncIOMotorClient(mongo_url)
    db = client["charitage"]
    
    existing = await db.users.find_one({"email": args.email})
    if existing:
        await db.users.update_one({"email": args.email}, {"$set": {"role": "admin"}})
        print(f"User {args.email} already exists. Role updated to admin.")
    else:
        new_user = {
            "id": str(uuid.uuid4()),
            "email": args.email,
            "name": args.name,
            "role": "admin",
            "hashed_password": get_password_hash(args.password),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(new_user)
        print(f"Created new admin user: {args.email} with password: {args.password}")

if __name__ == "__main__":
    asyncio.run(main())
