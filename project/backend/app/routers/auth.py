import bcrypt
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

# ── Demo users ────────────────────────────────────────────────────────────────
# Passwords are stored as bcrypt hashes (cost factor 12), never as plaintext.
# All three demo accounts use "password123" — hashes differ because each has
# its own random salt, which is correct bcrypt behaviour.
#
# To generate a hash for a new user:
#   python3 -c "import bcrypt; print(bcrypt.hashpw(b'yourpassword', bcrypt.gensalt(rounds=12)).decode())"
#
# Before production: replace this dict with a real users table query.
DEMO_USERS = {
    "filing@clinic.gov.za": {
        "password_hash": b"$2b$12$TXDhNRzHw80GHe9Ic/YatevULilOVpFckXWvBV9DxvM7D3VuQvK.W",
        "role": "filing",
        "name": "Nandi",
    },
    "pharmacy@clinic.gov.za": {
        "password_hash": b"$2b$12$OBJM9wUV6w6p31X4HX2wjuXistwVrqXCLRKKO6gAjz7FdtCOakt/e",
        "role": "pharmacy",
        "name": "Sipho",
    },
    "admin@clinic.gov.za": {
        "password_hash": b"$2b$12$iGAJYnAkCsE78KwEVMWqIO.mgHRdyt1J8n1YlA/fNLTfTCVpMNYlW",
        "role": "admin",
        "name": "Admin",
    },
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

    # OWASP A02 Defense: bcrypt.checkpw does a constant-time comparison,
    # preventing timing attacks. The plaintext == hash check it replaces
    # was vulnerable to both timing attacks and accidental plaintext exposure.
    password_correct = user is not None and bcrypt.checkpw(
        form_data.password.encode("utf-8"),
        user["password_hash"],
    )

    if not password_correct:
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
