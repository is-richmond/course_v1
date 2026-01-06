"""Reminder types and messages models"""

from datetime import datetime, time
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Time, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class ReminderType(Base):
    """Types of reminders (e.g., 'Homework Tomorrow', 'First Reminder', etc.)"""
    __tablename__ = "reminder_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)  # "ДЗ на завтра", "Первое напоминание"
    time = Column(Time, nullable=False)  # 21:00, 11:00, 20:00, 00:00
    days_of_week = Column(String(50), nullable=True)  # "1,2,3,4,5" for Mon-Fri
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class ReminderMessagePool(Base):
    """Pool of messages for each reminder type"""
    __tablename__ = "reminder_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    reminder_type_id = Column(Integer, ForeignKey('reminder_types.id'), nullable=False, index=True)
    message = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)  # Optional image
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)


class WelcomeMessage(Base):
    """Welcome messages and FAQ"""
    __tablename__ = "welcome_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    message_type = Column(String(50), nullable=False)  # "welcome", "how_to_use", "guarantee", "anki"
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    button_text = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)