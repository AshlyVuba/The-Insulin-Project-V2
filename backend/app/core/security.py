import os
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from dotenv import load_dotenv

from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)
print("Current Working Directory:", os.getcwd())
print("JWT_SECRET_KEY =", os.getenv("JWT_SECRET_KEY"))

# ==========================================
# CONFIGURATION & ENVIRONMENT VARIABLES
# ==========================================

# OWASP A02:2021 (Cryptographic Failures) Defense:
# The secret key is pulled from the environment. It is NEVER hardcoded.
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"

# OWASP A07:2021 (Identification and Authentication Failures) Defense:
# Tokens expire after an 8-hour clinic shift to prevent hijacked sessions.
ACCESS_TOKEN_EXPIRE_MINUTES = 480

# FastAPI utility to extract the token from the Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


# ==========================================
# 1. GENERATE TOKEN (LOGIN ROUTE)
# ==========================================

def create_access_token(data: dict) -> str:
    """
    Generates a cryptographically signed JWT.
    Expected data payload: {"sub": "username", "role": "clerk_or_pharmacist"}
    """
    # Failsafe: Ensure the server doesn't boot without a secret key
    if not SECRET_KEY:
        raise RuntimeError("CRITICAL: JWT_SECRET_KEY environment variable is missing.")

    to_encode = data.copy()

    # Set the strict expiration timestamp
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    # Sign the token using HMAC SHA-256
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# ==========================================
# 2. VERIFY TOKEN (MIDDLEWARE FOR ENDPOINTS)
# ==========================================

def verify_token(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Middleware that intercepts API requests to validate the token
    before allowing access to protected clinic data.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # OWASP A02:2021 Defense:
        # Explicitly enforce the 'HS256' algorithm to prevent 'None' algorithm attacks.
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Extract the user's role
        role: str = payload.get("role")

        # OWASP A01:2021 (Broken Access Control) Groundwork:
        # If the token is valid but has no role assigned, block access immediately.
        if role is None:
            raise credentials_exception

        # Return the decoded payload so the endpoint knows exactly who is making the request
        return payload

    except jwt.ExpiredSignatureError:
        # Triggered automatically if the 8-hour shift window has passed
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        # Triggered if the token is malformed, tampered with, or signed with the wrong key
        raise credentials_exception


# ==========================================
# 3. ROLE-BASED ACCESS CONTROL (OWASP A01)
# ==========================================

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        """Initializes the required roles for a specific route."""
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: dict = Depends(verify_token)):
        """
        FastAPI runs this before executing the route.
        Blocks OWASP A01 (Broken Access Control) attempts.
        """
        user_role = current_user.get("role")

        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: The '{user_role}' role does not have permission to perform this action.",
            )
        return current_user