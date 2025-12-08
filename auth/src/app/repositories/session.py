"""Session repository."""

import logging
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth.src.app.models.session import Session
from auth.src.app.repositories.base import BaseRepository

logger = logging.getLogger(__name__)


class SessionRepository(BaseRepository[Session]):
    """Repository for Session model."""
    
    def __init__(self, session: AsyncSession):
        """
        Initialize session repository.
        
        Args:
            session: Async database session
        """
        super().__init__(Session, session)
    
    async def get_by_user_id(self, user_id: UUID) -> List[Session]:
        """
        Get all sessions for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            List[Session]: List of user sessions
        """
        result = await self.session.execute(
            select(Session).where(Session. user_id == user_id)
        )
        return list(result.scalars().all())
    
    async def delete_user_sessions(self, user_id: UUID) -> int:
        """
        Delete all sessions for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            int: Number of deleted sessions
        """
        sessions = await self.get_by_user_id(user_id)
        count = len(sessions)
        
        for session in sessions:
            await self.session.delete(session)
        
        await self.session.commit()
        
        logger.info(f"Deleted {count} sessions for user {user_id}")
        
        return count