"""Streak service - tracks user homework streaks based on schedule"""

from datetime import datetime, date, timedelta
from typing import Optional
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import random
from src.config import settings
from src.utils.logger import get_logger
from src.models.homework_model import Base, UserStreak, StreakMessage

logger = get_logger(__name__)

try:
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Streak tables created")
except Exception as e: 
    logger.error(f"❌ Database error: {e}")
    raise


class StreakService:
    """Service for managing user streaks"""
    
    def __init__(self):
        self.db: Session = SessionLocal()
    
    def get_or_create_streak(self, user_id: str, schedule_id: int) -> UserStreak:
        """Get or create streak for user"""
        streak = self.db.query(UserStreak).filter(
            UserStreak.user_id == user_id,
            UserStreak.homework_schedule_id == schedule_id
        ).first()
        
        if not streak:
            streak = UserStreak(
                user_id=user_id,
                homework_schedule_id=schedule_id
            )
            self.db.add(streak)
            self.db.commit()
            self.db.refresh(streak)
            logger.info(f"✅ Created streak for user {user_id}")
        
        return streak
    
    def update_streak(self, user_id: str, schedule_id: int) -> dict:
        """Update streak when homework completed"""
        from src.services.homework_schedule_service import homework_schedule_service
        
        streak = self.get_or_create_streak(user_id, schedule_id)
        
        # Get homework days
        homework_days = homework_schedule_service.get_days(schedule_id)
        if not homework_days:
            return {"updated": False, "message": "No schedule configured"}
        
        today = date.today()
        today_weekday = today.weekday() + 1  # 1=ПН, 7=ВС
        
        # Check if homework today
        if today_weekday not in homework_days:
            return {"updated": False, "message":  "No homework today"}
        
        # Already updated today
        if streak.last_completed_date == today:
            return {"updated": False, "current_streak": streak.current_streak}
        
        # Find last homework day before today
        last_hw_day = today - timedelta(days=1)
        while last_hw_day. weekday() + 1 not in homework_days:
            last_hw_day -= timedelta(days=1)
        
        # Continue or reset streak
        if streak.last_completed_date == last_hw_day:
            streak.current_streak += 1
        else:
            streak.current_streak = 1
        
        # Update record
        if streak.current_streak > streak. longest_streak:
            streak.longest_streak = streak.current_streak
        
        streak.last_completed_date = today
        streak.updated_at = datetime.now()
        self.db.commit()
        
        logger.info(f"✅ Updated streak:  user={user_id}, streak={streak.current_streak}")
        
        # Get congratulation
        congrats = self.get_congratulation(streak.current_streak)
        
        return {
            "updated":  True,
            "current_streak": streak.current_streak,
            "longest_streak": streak. longest_streak,
            "congratulation": congrats
        }
    
    def get_congratulation(self, streak_days: int) -> Optional[str]:
        """Get congratulation for milestone"""
        milestones = [3, 5, 7, 10, 14, 21, 30, 45, 60, 90, 100]
        
        if streak_days not in milestones:
            return None
        
        messages = self.db.query(StreakMessage).filter(
            StreakMessage.streak_days == streak_days,
            StreakMessage.is_active == True
        ).all()
        
        return random.choice(messages).message if messages else None
    
    def get_user_streak(self, user_id: str, schedule_id: int) -> dict:
        """Get user streak info"""
        streak = self.get_or_create_streak(user_id, schedule_id)
        return {
            "current_streak": streak.current_streak,
            "longest_streak": streak.longest_streak,
            "last_completed":  streak.last_completed_date
        }
    
    def create_message(self, streak_days: int, message: str) -> bool:
        """Create streak message (admin)"""
        try:
            msg = StreakMessage(streak_days=streak_days, message=message)
            self.db.add(msg)
            self.db.commit()
            logger.info(f"✅ Created message for {streak_days} days")
            return True
        except Exception as e:
            logger.error(f"Error:  {e}")
            self.db.rollback()
            return False
    
    def get_all_messages(self) -> list:
        """Get all messages"""
        return self.db. query(StreakMessage).order_by(StreakMessage. streak_days).all()


streak_service = StreakService()