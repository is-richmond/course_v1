"""Pydantic schemas for Bot database data."""

from datetime import datetime, date, time
from typing import Optional
from pydantic import BaseModel, ConfigDict


# ========== HOMEWORK SCHEMAS ==========

class UserHomeworkResponse(BaseModel):
    """Response schema for user homework."""
    id: int
    user_id: str
    date: date
    
    anki_submitted: bool
    anki_photo_url: Optional[str] = None
    anki_submitted_at: Optional[datetime] = None
    
    test_submitted: bool
    test_photo_url: Optional[str] = None
    test_submitted_at: Optional[datetime] = None
    
    lesson_submitted: bool
    lesson_photo_url: Optional[str] = None
    lesson_submitted_at: Optional[datetime] = None
    
    is_complete: bool
    completed_at: Optional[datetime] = None
    
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class HomeworkStatistics(BaseModel):
    """Homework statistics response."""
    total_submissions: int
    completed_submissions: int
    completion_rate: float
    
    anki_completed: int
    test_completed: int
    lesson_completed: int
    
    unique_users: int
    
    date_range_start: Optional[date] = None
    date_range_end: Optional[date] = None


# ========== STREAK SCHEMAS ==========

class UserStreakResponse(BaseModel):
    """Response schema for user streak."""
    id: int
    user_id: str
    homework_schedule_id: int
    current_streak: int
    longest_streak: int
    last_completed_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ========== GUARANTEE SCHEMAS ==========

class UserGuaranteeResponse(BaseModel):
    """Response schema for user guarantee."""
    id: int
    user_id: str
    has_guarantee: bool
    notes: Optional[str] = None
    updated_by: Optional[str] = None
    updated_at: datetime
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ========== REMINDER SCHEMAS ==========

class ReminderTypeResponse(BaseModel):
    """Response schema for reminder type."""
    id: int
    name: str
    time: time
    days_of_week: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ReminderMessageResponse(BaseModel):
    """Response schema for reminder message."""
    id: int
    reminder_type_id: int
    message: str
    image_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class StreakMessageResponse(BaseModel):
    """Response schema for streak message."""
    id: int
    streak_days: int
    message: str
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)