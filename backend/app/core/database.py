from pathlib import Path
import os
import sys

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

# Load .env
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("\n" + "=" * 50)
    print("Database configuration error")
    print("=" * 50)
    print("\nDATABASE_URL was not found.")
    print("Please verify your .env configuration.")
    print("\nApplication startup aborted.")
    sys.exit(1)

# SQLAlchemy Engine with Connection Pool
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    echo=False
)

# Session Factory
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)

print("✓ PostgreSQL connection pool initialized")

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# def verify_connection():
#     try:
#         with engine.connect() as conn:
#             result = conn.execute(
#                 text(
#                     "SELECT current_user, current_database();"
#                 )
#             )

#             user, database = result.fetchone()

#             print(f"✓ Connected as {user}")
#             print(f"✓ Connected to database {database}")

#     except Exception as e:
#         print("\n" + "=" * 50)
#         print("Database connection error")
#         print("=" * 50)
#         print(f"\nUnable to connect to PostgreSQL.")
#         print(f"Reason: {e}")
#         print("\nApplication startup aborted.")
#         sys.exit(1)

def verify_connection():
    try:
        with engine.connect() as conn:
            # Check the dialect type and run the appropriate query
            if engine.dialect.name == "postgresql":
                conn.execute(text("SELECT current_user, current_database();"))
            else:
                # For SQLite, just do a simple selection that always works
                conn.execute(text("SELECT 1;")) 
            print("✓ Database connection pool initialized")
    except Exception as e:
        print("==================================================")
        print("Database connection error")
        print("==================================================")
        print(f"Unable to connect. Reason: {e}")
        import sys
        sys.exit(1)