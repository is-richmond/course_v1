"""Pydantic schemas for user data validation."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi_users import schemas


class UserRead(schemas.BaseUser[UUID]):
    """Schema for reading user data."""
    
    created_at: datetime
    updated_at: Optional[datetime] = None


class UserCreate(schemas.BaseUserCreate):
    """Schema for user registration."""
    
    pass


class UserUpdate(schemas.BaseUserUpdate):
    """Schema for updating user data."""
    
    pass
