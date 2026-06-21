import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Fallback to empty string if not explicitly defined in ..env
    DATABASE_URL: str = ""
    BOT_SECRET: str = ""

    # Fix the typo from '...env' to '..env'
    model_config = SettingsConfigDict(
        env_file="..env",
        extra="ignore"
    )

settings = Settings()