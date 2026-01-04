"""Configuration for Telegram Bot"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # Telegram
    BOT_TOKEN: str = Field(..., alias="BOT_TOKEN")
    BOT_USERNAME: str = Field(default="plexus_bot", alias="BOT_USERNAME")
    
    # API
    CORE_API_URL: str = Field(default="http://localhost:8000", alias="CORE_API_URL")
    API_TIMEOUT: int = Field(default=30, alias="API_TIMEOUT")
    
    # S3
    S3_ENDPOINT: str = Field(default="https://storage.yandexcloud.kz", alias="S3_ENDPOINT")
    S3_ACCESS_KEY: str = Field(..., alias="S3_ACCESS_KEY")
    S3_SECRET_KEY: str = Field(..., alias="S3_SECRET_KEY")
    S3_BUCKET: str = Field(default="course-media", alias="S3_BUCKET")
    S3_REGION: str = Field(default="kz1", alias="S3_REGION")
    
    # Database
    DATABASE_URL: str = Field(..., alias="DATABASE_URL")
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", alias="LOG_LEVEL")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()