# repositories/media_s3_config.py
import os
from pydantic_settings import BaseSettings
from typing import Optional, Set

class MediaS3Settings(BaseSettings):
    # Основные настройки S3
    S3_ENDPOINT: str = os.getenv("S3_ENDPOINT", "https://storage.yandexcloud.kz")
    S3_MEDIA_BUCKET: str = os.getenv("S3_MEDIA_BUCKET", "course-media")
    S3_ACCESS_KEY: str = os.getenv("S3_ACCESS_KEY", "")
    S3_SECRET_KEY: str = os.getenv("S3_SECRET_KEY", "")
    S3_REGION: str = os.getenv("S3_REGION", "kz1")
    
    # Ограничения для изображений
    MAX_IMAGE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES: Set[str] = {
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/webp',
        'image/gif'
    }
    ALLOWED_IMAGE_EXTENSIONS: Set[str] = {'jpg', 'jpeg', 'png', 'webp', 'gif'}
    
    # Ограничения для видео
    MAX_VIDEO_SIZE: int = 500 * 1024 * 1024  # 500MB
    ALLOWED_VIDEO_TYPES: Set[str] = {
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/quicktime'
    }
    ALLOWED_VIDEO_EXTENSIONS: Set[str] = {'mp4', 'webm', 'ogg', 'mov'}
    
    class Config:
        env_file = ".env"

media_s3_settings = MediaS3Settings()