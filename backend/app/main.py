from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.core.database import verify_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    verify_connection()

    yield

    # Shutdown
    print("✓ Application shutting down")


app = FastAPI(
    title="Insulin Express API",
    version="1.0.0",
    lifespan=lifespan
)


@app.get("/")
def root():
    return {
        "message": "Insulin Express API Running"
    }