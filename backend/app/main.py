from fastapi import FastAPI
from app.core.database import verify_connection

app = FastAPI(
    title="Insulin Express API",
    version="1.0.0"
)

@app.on_event("startup")
def startup_event():
    verify_connection()