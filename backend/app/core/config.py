from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv() 


SECRET_KEY = os.getenv("JWT_SECRET_KEY")
POPIA_ENCRYPTION_KEY = os.getenv("POPIA_ENCRYPTION_KEY")

class Settings(BaseSettings):
    DB_HOST: str
    DB_PORT: int
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str

    class Config:
        env_file = "..env"

    @property
    def DATABASE_URL(self):
        return (
            f"postgresql+psycopg://"
            f"{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )


settings = Settings()