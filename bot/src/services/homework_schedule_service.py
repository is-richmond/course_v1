"""Homework schedule service"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from src.config import settings
from src.utils.logger import get_logger
from src.models. homework_model import Base, HomeworkSchedule

logger = get_logger(__name__)

try:
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Homework schedule tables created")
except Exception as e: 
    logger.error(f"❌ Database connection error: {e}")
    raise


class HomeworkScheduleService: 
    """Service for managing homework schedules"""
    
    def __init__(self):
        self.db:  Session = SessionLocal()
    
    def create_schedule(
        self,
        name: str,
        days_of_week: List[int]  # [1, 2, 3, 4] = ПН-ЧТ
    ) -> Optional[int]:
        """Create new homework schedule"""
        try: 
            days_str = ','.join(map(str, days_of_week)) if days_of_week else None
            
            new_schedule = HomeworkSchedule(
                name=name,
                days_of_week=days_str
            )
            
            self. db.add(new_schedule)
            self.db.commit()
            self.db.refresh(new_schedule)
            
            logger.info(f"✅ Created homework schedule: {name} - Days: {days_str}")
            return new_schedule.id
        except Exception as e:
            logger.error(f"Error creating homework schedule: {e}")
            self.db.rollback()
            return None
    
    def get_schedule(self, schedule_id: int) -> Optional[HomeworkSchedule]:
        """Get schedule by ID"""
        return self.db.query(HomeworkSchedule).filter(
            HomeworkSchedule.id == schedule_id,
            HomeworkSchedule.is_active == True
        ).first()
    
    def get_all_schedules(self) -> List[HomeworkSchedule]: 
        """Get all active schedules"""
        return self. db.query(HomeworkSchedule).filter(
            HomeworkSchedule.is_active == True
        ).all()
    
    def get_days(self, schedule_id: int) -> List[int]:
        """Get homework days for schedule"""
        schedule = self.get_schedule(schedule_id)
        if not schedule or not schedule.days_of_week:
            return []
        return [int(d) for d in schedule.days_of_week. split(',')]
    
    def update_schedule(
        self,
        schedule_id: int,
        days_of_week: list
    ) -> bool:
        """Update schedule days"""
        try:
            schedule = self.get_schedule(schedule_id)
            if not schedule:
                return False
            
            days_str = ','.join(map(str, days_of_week))
            schedule.days_of_week = days_str
            schedule.updated_at = datetime.now()
            
            self.db.commit()
            logger.info(f"✅ Updated schedule {schedule_id}: {days_str}")
            return True
        except Exception as e:
            logger.error(f"Error updating schedule:  {e}")
            self.db.rollback()
            return False

    def set_as_default(self, schedule_id: int) -> bool:
        """Set schedule as default"""
        try:
            # Deactivate all others
            self.db.query(HomeworkSchedule).update(
                {HomeworkSchedule.is_active: False}
            )
            
            # Activate this one
            schedule = self.db.query(HomeworkSchedule).filter(
                HomeworkSchedule.id == schedule_id
            ).first()
            
            if schedule:
                schedule.is_active = True
                self.db. commit()
                logger.info(f"✅ Set schedule {schedule_id} as default")
                return True
            
            return False
        except Exception as e:
            logger.error(f"Error setting default:  {e}")
            self.db.rollback()
            return False


# Global instance
homework_schedule_service = HomeworkScheduleService()