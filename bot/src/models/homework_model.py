"""Homework database models"""

from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Text, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID
import uuid

Base = declarative_base()

class UserHomework(Base):
    """User homework submissions"""
    __tablename__ = "user_homework"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    date = Column(Date, nullable=False, default=date.today)
    
    # Anki
    anki_submitted = Column(Boolean, default=False)
    anki_photo_url = Column(String(500), nullable=True)
    anki_submitted_at = Column(DateTime, nullable=True)
    
    # Test
    test_submitted = Column(Boolean, default=False)
    test_photo_url = Column(String(500), nullable=True)
    test_submitted_at = Column(DateTime, nullable=True)
    
    # Lesson
    lesson_submitted = Column(Boolean, default=False)
    lesson_photo_url = Column(String(500), nullable=True)
    lesson_submitted_at = Column(DateTime, nullable=True)
    
    # Completion
    is_complete = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    __table_args__ = (
        UniqueConstraint('user_id', 'date', name='unique_user_date'),
    )


class UserStreak(Base):
    """User streak tracking"""
    __tablename__ = "user_streaks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_completed_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class StreakMessage(Base):
    """Congratulation messages for streaks"""
    __tablename__ = "streak_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    streak_days = Column(Integer, nullable=False, index=True)  # 3, 5, 7, 10, 14, 21, 30
    message = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)


class UserGuarantee(Base):
    """User guarantee status"""
    __tablename__ = "user_guarantee"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    has_guarantee = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    updated_by = Column(String(255), nullable=True)  # Admin ID
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    created_at = Column(DateTime, default=datetime.now)