"""Streak service - tracks user homework streaks"""

from datetime import datetime, date, timedelta
from typing import Optional
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import random
from src.config import settings
from src.utils.logger import get_logger
from src.models.homework_model import Base, UserStreak, StreakMessage

logger = get_logger(__name__)

# Database setup
try:
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Streak database tables created")
except Exception as e:
    logger.error(f"❌ Database connection error: {e}")
    raise

class StreakService:
    """Service for managing user streaks"""
    
    def __init__(self):
        self.db: Session = SessionLocal()
    
    def get_or_create_streak(self, user_id: int) -> UserStreak:
        """Get or create streak record for user"""
        streak = self.db.query(UserStreak).filter(
            UserStreak.user_id == user_id
        ).first()
        
        if not streak:
            streak = UserStreak(user_id=user_id)
            self.db.add(streak)
            self.db.commit()
            self.db.refresh(streak)
            logger.info(f"✅ Created streak record for user {user_id}")
        
        return streak
    
    def update_streak(self, user_id: int) -> dict:
        """Update user streak when homework completed"""
        streak = self.get_or_create_streak(user_id)
        today = date.today()
        yesterday = today - timedelta(days=1)
        
        # If already updated today, skip
        if streak.last_completed_date == today:
            return {
                "updated": False,
                "current_streak": streak.current_streak,
                "message": "Already updated today"
            }
        
        # Check if streak continues
        if streak.last_completed_date == yesterday:
            # Continue streak
            streak.current_streak += 1
        elif streak.last_completed_date is None or streak.last_completed_date < yesterday:
            # Reset streak (missed a day or first time)
            streak.current_streak = 1
        
        # Update longest streak
        if streak.current_streak > streak.longest_streak:
            streak.longest_streak = streak.current_streak
        
        streak.last_completed_date = today
        streak.updated_at = datetime.now()
        
        self.db.commit()
        
        logger.info(f"✅ Updated streak for user {user_id}: {streak.current_streak} days")
        
        # Check if we need to send congratulation
        congrats_message = self.get_streak_congratulation(streak.current_streak)
        
        return {
            "updated": True,
            "current_streak": streak.current_streak,
            "longest_streak": streak.longest_streak,
            "congratulation": congrats_message
        }
    
    def get_streak_congratulation(self, streak_days: int) -> Optional[str]:
        """Get congratulation message for streak milestone"""
        # Check if this is a milestone (3, 5, 7, 10, 14, 21, 30, etc.)
        milestones = [3, 5, 7, 10, 14, 21, 30, 45, 60, 90, 100]
        
        if streak_days not in milestones:
            return None
        
        # Get all messages for this milestone
        messages = self.db.query(StreakMessage).filter(
            StreakMessage.streak_days == streak_days,
            StreakMessage.is_active == True
        ).all()
        
        if not messages:
            return None
        
        # Pick random message
        selected = random.choice(messages)
        return selected.message
    
    def get_user_streak(self, user_id: int) -> dict:
        """Get user's current streak info"""
        streak = self.get_or_create_streak(user_id)
        
        return {
            "current_streak": streak.current_streak,
            "longest_streak": streak.longest_streak,
            "last_completed": streak.last_completed_date
        }
    
    def create_streak_message(self, streak_days: int, message: str) -> bool:
        """Create new streak congratulation message (admin function)"""
        try:
            new_message = StreakMessage(
                streak_days=streak_days,
                message=message
            )
            self.db.add(new_message)
            self.db.commit()
            logger.info(f"✅ Created streak message for {streak_days} days")
            return True
        except Exception as e:
            logger.error(f"Error creating streak message: {e}")
            self.db.rollback()
            return False
    
    def get_all_streak_messages(self) -> list:
        """Get all streak messages (admin function)"""
        return self.db.query(StreakMessage).order_by(StreakMessage.streak_days).all()
    
    def delete_streak_message(self, message_id: int) -> bool:
        """Delete streak message (admin function)"""
        try:
            message = self.db.query(StreakMessage).filter(
                StreakMessage.id == message_id
            ).first()
            
            if message:
                self.db.delete(message)
                self.db.commit()
                logger.info(f"✅ Deleted streak message {message_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting streak message: {e}")
            self.db.rollback()
            return False

# Global instance
streak_service = StreakService()