"""User model"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserResponse(BaseModel):
    """User response from API"""
    id: int
    telegram_id: Optional[int] = None
    username: Optional[str] = None
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class PhotoResponse(BaseModel):
    """Photo response"""
    id: int
    user_id: int
    s3_key: str
    uploaded_at: datetime
    url: Optional[str] = None
    
    class Config:
        from_attributes = True

class PhotoUploadRequest(BaseModel):
    """Photo upload request"""
    user_id: int
    filename: str