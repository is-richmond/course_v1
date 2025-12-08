"""Configuration settings for the course platform application."""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    # JWT Settings
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database Settings
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/core.db"
    
    # Application Settings
    APP_NAME: str = "Course Platform API"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = True
    
    # CORS Settings
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Auth Service Settings
    AUTH_SERVICE_URL: str = "http://localhost:8001"
    
    # S3 Settings (for future media uploads)
    S3_BUCKET_NAME: str = "course-platform-media"
    S3_REGION: str = "us-east-1"
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""
    S3_ENDPOINT_URL: str = ""  # Optional for MinIO/LocalStack
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()