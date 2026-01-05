"""User and Photo models"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Union

class UserResponse(BaseModel):
    """User response from Auth API"""
    id: Union[int, str]
    phone: str
    email: str
    first_name:  str
    last_name: Optional[str] = None
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class PhotoResponse(BaseModel):
    """Photo response from Core API"""
    id: str  # ← UUID строка из Core
    filename: str
    original_filename: Optional[str] = None
    custom_name: Optional[str] = None
    size: int
    content_type: str
    media_type: str
    s3_key: str
    course_id: Optional[int] = None
    lesson_id: Optional[int] = None
    question_option_id: Optional[int] = None
    test_question_id: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    duration: Optional[int] = None
    uploaded_by: Optional[str] = None
    created_at: datetime  # ← ИЗМЕНИ с uploaded_at
    updated_at: datetime
    download_url: Optional[str] = None
    
    class Config:
        from_attributes = True