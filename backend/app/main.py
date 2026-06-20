from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import verify_connection
from app.routers import filing, pharmacy, auth, bot

app = FastAPI(title="Insulin Express API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Single Source of Truth for Routers
app.include_router(auth.router,     prefix="/api")
app.include_router(filing.router,   prefix="/api/v1")
app.include_router(pharmacy.router, prefix="/api/v1")
app.include_router(bot.router,      prefix="/api/v1")

@app.on_event("startup")
def startup_event():
    verify_connection()

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}