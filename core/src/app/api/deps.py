"""API dependencies for core service."""

import logging
from typing import AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from core.src.app.db.database import get_async_session
from core.src.app.core.config import settings

logger = logging.getLogger(__name__)

security = HTTPBearer()

# Constant for UUID to int conversion
USER_ID_HASH_MODULO = 10 ** 10


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Get database session for core service.
    
    Yields:
        AsyncSession: Database session
    """
    async for session in get_async_session():
        yield session


async def get_bot_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Get database session for bot service.
    
    Yields:
        AsyncSession: Bot database session
    """
    from core.src.app.db.bot_db import get_bot_async_session
    async for session in get_bot_async_session():
        yield session

async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """Get current authenticated user ID from JWT token."""
    token = credentials.credentials
    
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )
        user_id_str = payload.get("sub")
        
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return str(user_id_str)  # Возвращаем UUID как строку
        
    except JWTError as e:
        logger.error(f"Token decode error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )