"""Guarantee service - manages user guarantee status"""

from datetime import datetime
from typing import Optional
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from src.config import settings
from src.utils.logger import get_logger
from src.models.homework_model import Base, UserGuarantee

logger = get_logger(__name__)

# Database setup
try:
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Guarantee database tables created")
except Exception as e:
    logger.error(f"❌ Database connection error: {e}")
    raise

class GuaranteeService:
    """Service for managing user guarantee status"""
    
    def __init__(self):
        self.db: Session = SessionLocal()
    
    def get_or_create_guarantee(self, user_id: int) -> UserGuarantee:
        """Get or create guarantee record for user"""
        guarantee = self.db.query(UserGuarantee).filter(
            UserGuarantee.user_id == user_id
        ).first()
        
        if not guarantee:
            guarantee = UserGuarantee(
                user_id=user_id,
                has_guarantee=True  # Default to True for new users
            )
            self.db.add(guarantee)
            self.db.commit()
            self.db.refresh(guarantee)
            logger.info(f"✅ Created guarantee record for user {user_id}")
        
        return guarantee
    
    def set_guarantee_status(
        self,
        user_id: int,
        has_guarantee: bool,
        admin_id: str,
        notes: Optional[str] = None
    ) -> bool:
        """Set guarantee status for user (admin function)"""
        try:
            guarantee = self.get_or_create_guarantee(user_id)
            guarantee.has_guarantee = has_guarantee
            guarantee.updated_by = admin_id
            guarantee.updated_at = datetime.now()
            
            if notes:
                guarantee.notes = notes
            
            self.db.commit()
            
            status = "✅ enabled" if has_guarantee else "❌ disabled"
            logger.info(f"Guarantee {status} for user {user_id} by admin {admin_id}")
            
            return True
        except Exception as e:
            logger.error(f"Error setting guarantee: {e}")
            self.db.rollback()
            return False
    
    def check_guarantee(self, user_id: int) -> bool:
        """Check if user has guarantee"""
        guarantee = self.get_or_create_guarantee(user_id)
        return guarantee.has_guarantee
    
    def get_guarantee_info(self, user_id: int) -> dict:
        """Get guarantee information for user"""
        guarantee = self.get_or_create_guarantee(user_id)
        
        return {
            "has_guarantee": guarantee.has_guarantee,
            "notes": guarantee.notes,
            "updated_by": guarantee.updated_by,
            "updated_at": guarantee.updated_at
        }
    
    def get_all_users_guarantee(self) -> list:
        """Get guarantee status for all users (admin function)"""
        guarantees = self.db.query(UserGuarantee).all()
        return guarantees

# Global instance
guarantee_service = GuaranteeService()