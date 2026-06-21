import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
from sqlalchemy import text

# Fix the path from '...env' to '..env'
load_dotenv(dotenv_path=".env")

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the environment or ..env file.")

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_connection():
    """Validates the database connection by executing a simple test query."""
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        print("Database connection successfully verified.")
    except Exception as e:
        print(f"Database connection verification failed: {e}")
        raise e
    finally:
        db.close()