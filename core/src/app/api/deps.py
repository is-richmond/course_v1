"""API dependencies for core service."""

import logging
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from core.src.app.db.database import get_async_session

logger = logging.getLogger(__name__)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Get database session for core service.
    
    Yields:
        AsyncSession: Database session
    """
    async for session in get_async_session():
        yield session