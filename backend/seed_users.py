import asyncio
import os
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

load_dotenv()

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

async def main():
    print("Seeding default credentials...")

    # 1. Admin User
    admin_email = "admin@charitage.com"
    admin_pass = "adminpass123"
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        admin_doc = {
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "System Admin",
            "phone": "9876543210",
            "pan": "ABCDE1234F",
            "role": "admin",
            "hashed_password": get_password_hash(admin_pass),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_doc)
        print(f"Created Admin: {admin_email} / {admin_pass}")
    else:
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"hashed_password": get_password_hash(admin_pass), "role": "admin"}}
        )
        print(f"Updated Admin: {admin_email} / {admin_pass}")

    # 2. Regular User
    user_email = "user@charitage.com"
    user_pass = "userpass123"
    existing_user = await db.users.find_one({"email": user_email})
    if not existing_user:
        user_doc = {
            "id": str(uuid.uuid4()),
            "email": user_email,
            "name": "John Doe",
            "phone": "9876543211",
            "pan": "VWXYZ5678G",
            "role": "donor",
            "hashed_password": get_password_hash(user_pass),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        print(f"Created User: {user_email} / {user_pass}")
    else:
        await db.users.update_one(
            {"email": user_email},
            {"$set": {"hashed_password": get_password_hash(user_pass), "role": "donor"}}
        )
        print(f"Updated User: {user_email} / {user_pass}")

    # List all users
    users = await db.users.find({}, {"_id": 0, "hashed_password": 0}).to_list(100)
    print("\nAll Users in Database:")
    for u in users:
        print(f"  - Email: {u.get('email')}, Role: {u.get('role')}, Name: {u.get('name')}")

if __name__ == "__main__":
    asyncio.run(main())
