# backend/test_env.py

import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / ".env"

print("Looking for:", env_path)

load_dotenv(env_path)

print("JWT_SECRET_KEY =", os.getenv("JWT_SECRET_KEY"))