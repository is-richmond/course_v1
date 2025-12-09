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


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Get database session for core service.
    
    Yields:
        AsyncSession: Database session
    """
    async for session in get_async_session():
        yield session


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> int:
    """
    Get current authenticated user ID from JWT token.
    
    Args:
        credentials: HTTP authorization credentials
        
    Returns:
        int: Current authenticated user ID
        
    Raises:
        HTTPException: If token is invalid
    """
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
        
        # Try to convert to int (for compatibility with both UUID and int user IDs)
        # In this case, we'll store user_id as a hash of UUID or the actual int
        try:
            user_id = int(user_id_str)
        except ValueError:
            # If it's a UUID string, hash it to get an int
            user_id = abs(hash(user_id_str)) % (10 ** 10)
        
        return user_id
        
    except JWTError as e:
        logger.error(f"Token decode error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )