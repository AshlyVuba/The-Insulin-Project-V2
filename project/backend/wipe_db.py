"""
wipe_db.py — Clears all tables for a clean slate.

Run from inside the backend/ directory:
    cd backend
    python wipe_db.py

WARNING: This drops and recreates the public schema. All data will be lost.
"""
from dotenv import load_dotenv
load_dotenv(dotenv_path=".env")

import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not found in .env")

print(f"Connecting to: {DATABASE_URL}")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    conn.execute(text("DROP SCHEMA public CASCADE; CREATE SCHEMA public;"))
    conn.commit()
    print("✅ Database schema cleared to a clean state.")