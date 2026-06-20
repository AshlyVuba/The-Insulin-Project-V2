from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

# ── Demo users ────────────────────────────────────────────────────────────────
# Replace with a real users table + hashed passwords before production.
DEMO_USERS = {
    "filing@clinic.gov.za":   {"password": "password123", "role": "filing",   "name": "Nandi"},
    "pharmacy@clinic.gov.za": {"password": "password123", "role": "pharmacy", "name": "Sipho"},
    "admin@clinic.gov.za":    {"password": "password123", "role": "admin",    "name": "Admin"},
}


@router.post("/login", summary="Staff login — returns JWT")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Accepts form-encoded username/password (OAuth2 standard).
    Returns a signed JWT plus the user object the frontend needs
    to set up role-based routing.

    Response shape:
        { access_token, token_type, user: { role, name } }
    """
    user = DEMO_USERS.get(form_data.username)

    if not user or user["password"] != form_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        data={"sub": form_data.username, "role": user["role"]}
    )

    return {
        "access_token": token,
        "token_type":   "bearer",
        "user": {
            "role": user["role"],
            "name": user["name"],
        },
    }