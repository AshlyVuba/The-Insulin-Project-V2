from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import verify_connection
from app.routers import filing, pharmacy, auth

app = FastAPI(
    title="Insulin Express API",
    version="1.0.0",
    description="Backend for the First Response Express clinic portal.",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,     prefix="/api")
app.include_router(filing.router,   prefix="/api/v1")
app.include_router(pharmacy.router, prefix="/api/v1")

# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup_event():
    verify_connection()

# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "Insulin Express API"}