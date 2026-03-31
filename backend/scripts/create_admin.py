"""
create_admin.py — Create or promote an admin user in the Charitage database.

Usage:
    python scripts/create_admin.py --email admin@example.com --password secret123
    python scripts/create_admin.py --email admin@example.com --password secret123 --name "Admin Name"

Reads MONGO_URL and DB_NAME from backend/.env automatically.
"""

import asyncio
import argparse
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

# Load .env from the backend directory (one level up from scripts/)
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


async def create_or_promote_admin(email: str, password: str, name: str):
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")

    if not mongo_url or not db_name:
        print("❌ Error: MONGO_URL and DB_NAME must be set in backend/.env")
        sys.exit(1)

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    try:
        existing = await db.users.find_one({"email": email})

        if existing:
            # User exists — just promote to admin
            await db.users.update_one({"email": email}, {"$set": {"role": "admin"}})
            print(f"✅ User '{email}' already exists. Role updated to admin.")
        else:
            # Create a new admin user
            new_user = {
                "id": str(uuid.uuid4()),
                "email": email,
                "name": name,
                "phone": None,
                "pan": None,
                "role": "admin",
                "hashed_password": get_password_hash(password),
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            await db.users.insert_one(new_user)
            print(f"✅ Admin user created successfully!")
            print(f"   Email   : {email}")
            print(f"   Name    : {name}")
            print(f"   Password: {password}")
            print(f"   DB      : {db_name}")
    finally:
        client.close()


def main():
    parser = argparse.ArgumentParser(
        description="Create or promote an admin user in the Charitage database."
    )
    parser.add_argument(
        "--email",
        required=True,
        help="Admin email address (required)"
    )
    parser.add_argument(
        "--password",
        required=True,
        help="Admin password (required)"
    )
    parser.add_argument(
        "--name",
        default="Admin",
        help="Admin display name (default: Admin)"
    )
    args = parser.parse_args()

    if len(args.password) < 6:
        print("❌ Error: Password must be at least 6 characters.")
        sys.exit(1)

    asyncio.run(create_or_promote_admin(args.email, args.password, args.name))


if __name__ == "__main__":
    main()
