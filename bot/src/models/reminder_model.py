"""Reminder database model"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class ReminderDB(Base):
    """Reminder database model"""
    __tablename__ = "reminders"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    from_user = Column(String(255), nullable=False)  # От кого
    admin_id = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    scheduled_at = Column(DateTime, nullable=True)  # Когда отправить
    is_active = Column(Boolean, default=True)
    sent_at = Column(DateTime, nullable=True)
    sent_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)

class BroadcastDB(Base):
    """Broadcast history"""
    __tablename__ = "broadcasts"
    
    id = Column(Integer, primary_key=True, index=True)
    reminder_id = Column(Integer, nullable=False)
    status = Column(String(50), default="pending")  # pending, sending, completed
    created_at = Column(DateTime, default=datetime.now)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    sent_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)