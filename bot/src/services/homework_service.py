"""Homework service - manages homework submissions"""

from datetime import datetime, date
from typing import Optional, Dict
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from src.config import settings
from src.utils.logger import get_logger
from src.models.homework_model import Base, UserHomework

logger = get_logger(__name__)

# Database setup
try:
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Homework database tables created")
except Exception as e:
    logger.error(f"❌ Database connection error: {e}")
    raise

class HomeworkService:
    """Service for managing homework submissions"""
    
    def __init__(self):
        self.db: Session = SessionLocal()
    
    def get_or_create_today_homework(self, user_id: int) -> UserHomework:
        """Get or create homework record for today"""
        today = date.today()
        
        homework = self.db.query(UserHomework).filter(
            UserHomework.user_id == user_id,
            UserHomework.date == today
        ).first()
        
        if not homework:
            homework = UserHomework(
                user_id=user_id,
                date=today
            )
            self.db.add(homework)
            self.db.commit()
            self.db.refresh(homework)
            logger.info(f"✅ Created homework record for user {user_id}")
        
        return homework
    
    def submit_homework(
        self,
        user_id: int,
        homework_type: str,  # "anki", "test", "lesson"
        photo_url: str
    ) -> Dict:
        """Submit homework photo"""
        homework = self.get_or_create_today_homework(user_id)
        now = datetime.now()
        
        try:
            if homework_type == "anki":
                homework.anki_submitted = True
                homework.anki_photo_url = photo_url
                homework.anki_submitted_at = now
            elif homework_type == "test":
                homework.test_submitted = True
                homework.test_photo_url = photo_url
                homework.test_submitted_at = now
            elif homework_type == "lesson":
                homework.lesson_submitted = True
                homework.lesson_photo_url = photo_url
                homework.lesson_submitted_at = now
            else:
                return {"success": False, "error": "Invalid homework type"}
            
            # Check if all 3 types completed
            if homework.anki_submitted and homework.test_submitted and homework.lesson_submitted:
                homework.is_complete = True
                homework.completed_at = now
            
            homework.updated_at = now
            self.db.commit()
            
            logger.info(f"✅ Homework {homework_type} submitted for user {user_id}")
            
            return {
                "success": True,
                "homework_type": homework_type,
                "is_complete": homework.is_complete,
                "anki_submitted": homework.anki_submitted,
                "test_submitted": homework.test_submitted,
                "lesson_submitted": homework.lesson_submitted
            }
        except Exception as e:
            logger.error(f"Error submitting homework: {e}")
            self.db.rollback()
            return {"success": False, "error": str(e)}
    
    def get_today_status(self, user_id: int) -> Dict:
        """Get today's homework status"""
        homework = self.get_or_create_today_homework(user_id)
        
        return {
            "anki_submitted": homework.anki_submitted,
            "test_submitted": homework.test_submitted,
            "lesson_submitted": homework.lesson_submitted,
            "is_complete": homework.is_complete,
            "completed_at": homework.completed_at
        }
    
    def get_user_homework_history(self, user_id: int, days: int = 7) -> list:
        """Get user's homework history"""
        from datetime import timedelta
        
        start_date = date.today() - timedelta(days=days)
        
        homework_list = self.db.query(UserHomework).filter(
            UserHomework.user_id == user_id,
            UserHomework.date >= start_date
        ).order_by(UserHomework.date.desc()).all()
        
        return homework_list
    
    def get_incomplete_users_today(self) -> list[int]:
        """Get list of user_ids who haven't completed homework today"""
        today = date.today()
        
        # Users who have record but not complete
        incomplete = self.db.query(UserHomework.user_id).filter(
            UserHomework.date == today,
            UserHomework.is_complete == False
        ).all()
        
        return [user[0] for user in incomplete]
    
    def get_completed_users_today(self) -> list[int]:
        """Get list of user_ids who completed homework today"""
        today = date.today()
        
        completed = self.db.query(UserHomework.user_id).filter(
            UserHomework.date == today,
            UserHomework.is_complete == True
        ).all()
        
        return [user[0] for user in completed]

# Global instance
homework_service = HomeworkService()