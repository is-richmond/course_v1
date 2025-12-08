"""User repository."""

import logging
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth.src.app.models import User
from auth.src.app.repositories.base import BaseRepository

logger = logging.getLogger(__name__)


class UserRepository(BaseRepository[User]):
    """Repository for User model."""
    
    def __init__(self, session: AsyncSession):
        """
        Initialize user repository.
        
        Args:
            session: Async database session
        """
        super().__init__(User, session)
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email. 
        
        Args:
            email: User email
            
        Returns:
            Optional[User]: User or None if not found
        """
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalars().first()
    
    async def get_by_username(self, username: str) -> Optional[User]:
        """
        Get user by username.
        
        Args:
            username: Username
            
        Returns:
            Optional[User]: User or None if not found
        """
        result = await self.session.execute(
            select(User).where(User.email == username)
        )
        return result.scalars().first()
    
    async def email_exists(self, email: str) -> bool:
        """
        Check if email exists. 
        
        Args:
            email: Email to check
            
        Returns:
            bool: True if email exists
        """
        user = await self.get_by_email(email)
        return user is not None