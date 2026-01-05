"""Reminder service with database support"""

from datetime import datetime
from typing import List, Optional
from dataclasses import dataclass
from sqlalchemy import create_engine, and_
from sqlalchemy.orm import sessionmaker, Session
from src.config import settings
from src.utils.logger import get_logger
from src.models. reminder_model import Base, ReminderDB

logger = get_logger(__name__)

# Database setup
try:
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    
    # Create tables
    Base.metadata. create_all(bind=engine)
    logger.info("✅ Database connected and tables created")
except Exception as e:
    logger. error(f"❌ Database connection error: {e}")
    raise

@dataclass
class Reminder: 
    """Reminder object"""
    id: int
    title: str
    message: str
    from_user: str
    admin_id: str
    created_at: datetime
    scheduled_at: Optional[datetime] = None
    is_active: bool = True
    sent_at: Optional[datetime] = None
    sent_count: int = 0
    failed_count: int = 0

class ReminderService:
    """Service for managing reminders with database"""
    
    def __init__(self):
        self.db:  Session = SessionLocal()
    
    def create_reminder(
        self,
        title: str,
        message: str,
        from_user: str,
        admin_id: str,
        scheduled_at: Optional[datetime] = None
    ) -> Reminder:
        """Create a new reminder"""
        reminder_db = ReminderDB(
            title=title,
            message=message,
            from_user=from_user,
            admin_id=admin_id,
            scheduled_at=scheduled_at,
            created_at=datetime.now()
        )
        
        self.db.add(reminder_db)
        self.db.commit()
        self.db.refresh(reminder_db)
        
        logger.info(f"✅ Reminder created in DB: {title} (ID: {reminder_db.id})")
        
        return self._db_to_reminder(reminder_db)
    
    def get_active_reminders(self) -> List[Reminder]:
        """Get all active reminders that should be sent now"""
        now = datetime.now()
        
        try:
            reminders_db = self.db.query(ReminderDB).filter(
                and_(
                    ReminderDB.is_active == True,
                    (ReminderDB.scheduled_at. is_(None)) | (ReminderDB.scheduled_at <= now)
                )
            ).all()
            
            return [self._db_to_reminder(r) for r in reminders_db]
        except Exception as e: 
            logger.error(f"Error getting active reminders: {e}")
            return []
    
    def get_pending_reminders(self) -> List[Reminder]:
        """Get all pending (scheduled for future) reminders"""
        now = datetime.now()
        
        try:
            reminders_db = self.db.query(ReminderDB).filter(
                and_(
                    ReminderDB.is_active == True,
                    ReminderDB.scheduled_at > now
                )
            ).all()
            
            return [self._db_to_reminder(r) for r in reminders_db]
        except Exception as e: 
            logger.error(f"Error getting pending reminders: {e}")
            return []
    
    def get_all_reminders(self) -> List[Reminder]:
        """Get all reminders"""
        try:
            reminders_db = self.db.query(ReminderDB).all()
            return [self._db_to_reminder(r) for r in reminders_db]
        except Exception as e:
            logger.error(f"Error getting all reminders:  {e}")
            return []
    
    def get_reminder_by_id(self, reminder_id: int) -> Optional[Reminder]:
        """Get reminder by ID"""
        try:
            reminder_db = self.db.query(ReminderDB).filter(ReminderDB.id == reminder_id).first()
            if reminder_db:
                return self._db_to_reminder(reminder_db)
            return None
        except Exception as e:
            logger.error(f"Error getting reminder {reminder_id}: {e}")
            return None
    
    def mark_as_sent(self, reminder_id: int, sent_count: int, failed_count: int):
        """Mark reminder as sent"""
        try:
            reminder_db = self.db.query(ReminderDB).filter(ReminderDB.id == reminder_id).first()
            if reminder_db:
                reminder_db.sent_at = datetime.now()
                reminder_db.sent_count = sent_count
                reminder_db. failed_count = failed_count
                reminder_db.is_active = False
                self.db.commit()
                logger.info(f"✅ Reminder {reminder_id} marked as sent")
        except Exception as e:
            logger.error(f"Error marking reminder as sent: {e}")
            self.db.rollback()
    
    def deactivate_reminder(self, reminder_id: int) -> bool:
        """Deactivate reminder"""
        try: 
            reminder_db = self. db.query(ReminderDB).filter(ReminderDB.id == reminder_id).first()
            if reminder_db: 
                reminder_db.is_active = False
                self.db. commit()
                logger.info(f"✅ Reminder deactivated: {reminder_id}")
                return True
            return False
        except Exception as e: 
            logger.error(f"Error deactivating reminder:  {e}")
            self.db.rollback()
            return False
    
    def delete_reminder(self, reminder_id: int) -> bool:
        """Delete reminder"""
        try: 
            reminder_db = self. db.query(ReminderDB).filter(ReminderDB.id == reminder_id).first()
            if reminder_db: 
                self.db.delete(reminder_db)
                self.db.commit()
                logger.info(f"✅ Reminder deleted: {reminder_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting reminder: {e}")
            self.db.rollback()
            return False
    
    def _db_to_reminder(self, reminder_db: ReminderDB) -> Reminder:
        """Convert DB model to Reminder"""
        return Reminder(
            id=reminder_db.id,
            title=reminder_db. title,
            message=reminder_db.message,
            from_user=reminder_db.from_user,
            admin_id=reminder_db.admin_id,
            created_at=reminder_db.created_at,
            scheduled_at=reminder_db.scheduled_at,
            is_active=reminder_db.is_active,
            sent_at=reminder_db.sent_at,
            sent_count=reminder_db.sent_count,
            failed_count=reminder_db.failed_count
        )

# Global instance
reminder_service = ReminderService()