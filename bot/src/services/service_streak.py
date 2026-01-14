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
        self.db:  Session = SessionLocal()
    
    def get_or_create_streak(self, user_id: str, schedule_id: int) -> UserStreak:
        """Get or create streak for user with specific schedule"""
        streak = self.db.query(UserStreak).filter(
            UserStreak.user_id == user_id,
            UserStreak.homework_schedule_id == schedule_id
        ).first()
        
        if not streak:
            streak = UserStreak(
                user_id=user_id,
                homework_schedule_id=schedule_id
            )
            self.db. add(streak)
            self.db.commit()
            self.db.refresh(streak)
            logger.info(f"✅ Created streak for user {user_id} with schedule {schedule_id}")
        
        return streak
    
    def get_user_active_streak(self, user_id: str) -> Optional[UserStreak]: 
        """Get user's streak with ACTIVE schedule"""
        from src.services.homework_schedule_service import homework_schedule_service
        
        # Get default (active) schedule
        active_schedules = homework_schedule_service. get_all_schedules()
        
        if not active_schedules:
            logger.warning(f"No active schedules found for user {user_id}")
            return None
        
        # Usually there's only one active, but take the first
        active_schedule = active_schedules[0]
        
        # Get or create streak for active schedule
        return self.get_or_create_streak(user_id, active_schedule.id)
    
    def update_streak(self, user_id: str, schedule_id: int) -> dict:
        """Update streak when homework completed"""
        from src.services.homework_schedule_service import homework_schedule_service
        
        streak = self.get_or_create_streak(user_id, schedule_id)
        
        # Get homework days
        homework_days = homework_schedule_service.get_days(schedule_id)
        if not homework_days:
            logger.warning(f"No homework days configured for schedule {schedule_id}")
            return {"updated": False, "message": "No schedule configured", "current_streak": 0}
        
        today = date.today()
        today_weekday = today.weekday() + 1  # 1=ПН, 7=ВС
        
        # Check if homework today
        if today_weekday not in homework_days:
            logger.info(f"No homework today for schedule {schedule_id}. Today is weekday {today_weekday}")
            return {"updated": False, "message": "No homework today", "current_streak": streak.current_streak}
        
        # Already updated today
        if streak.last_completed_date == today:
            logger.info(f"Streak already updated today for user {user_id}")
            return {"updated": False, "current_streak": streak.current_streak}
        
        # Find last homework day before today
        last_hw_day = today - timedelta(days=1)
        while last_hw_day.weekday() + 1 not in homework_days:
            last_hw_day -= timedelta(days=1)
        
        # Continue or reset streak
        if streak.last_completed_date == last_hw_day:
            streak.current_streak += 1
            logger.info(f"✅ Streak CONTINUED for user {user_id}:  {streak.current_streak}")
        else:
            streak. current_streak = 1
            logger.info(f"✅ Streak RESET for user {user_id}: 1")
        
        # Update record
        if streak.current_streak > streak. longest_streak:
            streak.longest_streak = streak.current_streak
        
        streak.last_completed_date = today
        streak.updated_at = datetime.now()
        self.db.commit()
        
        logger.info(f"✅ Streak updated:  user={user_id}, schedule={schedule_id}, streak={streak.current_streak}, longest={streak.longest_streak}")
        
        # Get congratulation
        congrats = self.get_congratulation(streak.current_streak)
        
        return {
            "updated":  True,
            "current_streak": streak.current_streak,
            "longest_streak":  streak.longest_streak,
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
        
        if not messages: 
            return None
            
        return random.choice(messages).message
    
    def get_user_streak(self, user_id: str, schedule_id: int = None) -> dict:
        """Get user streak info"""
        if schedule_id is None:
            # Get streak with active schedule
            streak = self.get_user_active_streak(user_id)
            if not streak:
                return {
                    "current_streak":  0,
                    "longest_streak": 0,
                    "last_completed_date": None
                }
        else:
            streak = self. get_or_create_streak(user_id, schedule_id)
        
        return {
            "current_streak": streak.current_streak,
            "longest_streak":  streak.longest_streak,
            "last_completed_date": streak.last_completed_date,
            "schedule_id": streak.homework_schedule_id
        }
    
    def create_streak_message(self, days:  int, message: str) -> bool:
        """Create streak congratulation message"""
        try:
            msg = StreakMessage(
                streak_days=days,
                message=message,
                is_active=True
            )
            self.db. add(msg)
            self.db.commit()
            logger. info(f"✅ Created streak message for {days} days")
            return True
        except Exception as e:
            logger.error(f"Error creating streak message:  {e}")
            self.db.rollback()
            return False
    
    def get_all_streak_messages(self):
        """Get all streak messages"""
        return self.db.query(StreakMessage).filter(
            StreakMessage.is_active == True
        ).all()


# Global instance
streak_service = StreakService()