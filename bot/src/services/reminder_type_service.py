"""Reminder type service - manages reminder types and message pools"""

from datetime import datetime, time
from typing import Optional, List
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import random
from src.config import settings
from src.utils.logger import get_logger
from src.models.reminder_types_model import Base, ReminderType, ReminderMessagePool, WelcomeMessage

logger = get_logger(__name__)

# Database setup
try:
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Reminder types database tables created")
except Exception as e:
    logger.error(f"❌ Database connection error: {e}")
    raise

class ReminderTypeService:
    """Service for managing reminder types and message pools"""
    
    def __init__(self):
        self.db: Session = SessionLocal()
    
    # ========== REMINDER TYPES ==========
    
    def create_reminder_type(
        self,
        name: str,
        time_str: str,  # "21:00"
        days_of_week: List[int]  # [1, 2, 3, 4, 5] for Mon-Fri
    ) -> Optional[int]:
        """Create new reminder type"""
        try:
            # Parse time
            hour, minute = map(int, time_str.split(':'))
            reminder_time = time(hour=hour, minute=minute)
            
            # Convert days list to string
            days_str = ','.join(map(str, days_of_week)) if days_of_week else None
            
            new_type = ReminderType(
                name=name,
                time=reminder_time,
                days_of_week=days_str
            )
            
            self.db.add(new_type)
            self.db.commit()
            self.db.refresh(new_type)
            
            logger.info(f"✅ Created reminder type: {name} at {time_str}")
            return new_type.id
        except Exception as e:
            logger.error(f"Error creating reminder type: {e}")
            self.db.rollback()
            return None
    
    def get_all_reminder_types(self) -> List[ReminderType]:
        """Get all reminder types"""
        return self.db.query(ReminderType).filter(
            ReminderType.is_active == True
        ).order_by(ReminderType.time).all()
    
    def get_reminder_type(self, type_id: int) -> Optional[ReminderType]:
        """Get reminder type by ID"""
        return self.db.query(ReminderType).filter(
            ReminderType.id == type_id
        ).first()
    
    def update_reminder_type(
        self,
        type_id: int,
        name: Optional[str] = None,
        time_str: Optional[str] = None,
        days_of_week: Optional[List[int]] = None
    ) -> bool:
        """Update reminder type"""
        try:
            reminder_type = self.get_reminder_type(type_id)
            if not reminder_type:
                return False
            
            if name:
                reminder_type.name = name
            
            if time_str:
                hour, minute = map(int, time_str.split(':'))
                reminder_type.time = time(hour=hour, minute=minute)
            
            if days_of_week is not None:
                reminder_type.days_of_week = ','.join(map(str, days_of_week))
            
            reminder_type.updated_at = datetime.now()
            self.db.commit()
            
            logger.info(f"✅ Updated reminder type {type_id}")
            return True
        except Exception as e:
            logger.error(f"Error updating reminder type: {e}")
            self.db.rollback()
            return False
    
    def delete_reminder_type(self, type_id: int) -> bool:
        """Deactivate reminder type"""
        try:
            reminder_type = self.get_reminder_type(type_id)
            if reminder_type:
                reminder_type.is_active = False
                self.db.commit()
                logger.info(f"✅ Deactivated reminder type {type_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting reminder type: {e}")
            self.db.rollback()
            return False
    
    # ========== MESSAGE POOL ==========
    
    def add_message_to_pool(
        self,
        reminder_type_id: int,
        message: str,
        image_url: Optional[str] = None
    ) -> bool:
        """Add message to reminder type pool"""
        try:
            new_message = ReminderMessagePool(
                reminder_type_id=reminder_type_id,
                message=message,
                image_url=image_url
            )
            
            self.db.add(new_message)
            self.db.commit()
            
            logger.info(f"✅ Added message to pool for type {reminder_type_id}")
            return True
        except Exception as e:
            logger.error(f"Error adding message to pool: {e}")
            self.db.rollback()
            return False
    
    def get_messages_for_type(self, reminder_type_id: int) -> List[ReminderMessagePool]:
        """Get all messages for reminder type"""
        return self.db.query(ReminderMessagePool).filter(
            ReminderMessagePool.reminder_type_id == reminder_type_id,
            ReminderMessagePool.is_active == True
        ).all()
    
    def get_random_message(self, reminder_type_id: int) -> Optional[dict]:
        """Get random message from pool"""
        messages = self.get_messages_for_type(reminder_type_id)
        
        if not messages:
            return None
        
        selected = random.choice(messages)
        
        return {
            "message": selected.message,
            "image_url": selected.image_url
        }
    
    def delete_message(self, message_id: int) -> bool:
        """Delete message from pool"""
        try:
            message = self.db.query(ReminderMessagePool).filter(
                ReminderMessagePool.id == message_id
            ).first()
            
            if message:
                message.is_active = False
                self.db.commit()
                logger.info(f"✅ Deactivated message {message_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting message: {e}")
            self.db.rollback()
            return False
    
    # ========== WELCOME MESSAGES ==========
    
    def create_welcome_message(
        self,
        message_type: str,  # "welcome", "how_to_use", "guarantee", "anki"
        title: str,
        message: str,
        button_text: Optional[str] = None
    ) -> bool:
        """Create welcome/FAQ message"""
        try:
            new_message = WelcomeMessage(
                message_type=message_type,
                title=title,
                message=message,
                button_text=button_text
            )
            
            self.db.add(new_message)
            self.db.commit()
            
            logger.info(f"✅ Created welcome message: {message_type}")
            return True
        except Exception as e:
            logger.error(f"Error creating welcome message: {e}")
            self.db.rollback()
            return False
    
    def get_welcome_message(self, message_type: str) -> Optional[WelcomeMessage]:
        """Get welcome message by type"""
        return self.db.query(WelcomeMessage).filter(
            WelcomeMessage.message_type == message_type,
            WelcomeMessage.is_active == True
        ).first()
    
    def get_all_welcome_messages(self) -> List[WelcomeMessage]:
        """Get all welcome messages"""
        return self.db.query(WelcomeMessage).filter(
            WelcomeMessage.is_active == True
        ).all()

# Global instance
reminder_type_service = ReminderTypeService()