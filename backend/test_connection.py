from dotenv import load_dotenv
from pathlib import Path
from sqlalchemy import create_engine, text
import os

# Load .env
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not found in .env")

print("Attempting database connection...")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

try:
    with engine.connect() as conn:
        result = conn.execute(
            text(
                "SELECT current_user, current_database();"
            )
        )

        user, database = result.fetchone()

        print("\n================================")
        print("DATABASE CONNECTION SUCCESSFUL")
        print("================================")
        print(f"User: {user}")
        print(f"Database: {database}")

except Exception as e:
    print("\n================================")
    print("DATABASE CONNECTION FAILED")
    print("================================")
    print(e)