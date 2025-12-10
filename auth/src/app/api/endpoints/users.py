"""User management API endpoints."""

import logging
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from auth.src.app.api.deps import (
    get_db_session,
    get_current_user,
    get_current_active_user,
    get_current_superuser,
)
from auth.src.app.db.database import get_async_session
from auth.src.app.exceptions import UserNotFoundError
from auth.src.app.models.user import User
from auth.src.app.repositories import UserRepository
from auth.src.app.schemas import UserRead, UserUpdate, UserCreate


logger = logging. getLogger(__name__)
router = APIRouter()


@router. get(
    "/me",
    status_code=status.HTTP_200_OK,
    response_model=UserRead,
    description="Get current user information",
    response_model_exclude_none=True,
)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
) -> UserRead:
    """
    Get information about the currently authenticated user.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        UserRead: Current user information
    """
    logger.info(f"User info requested: {current_user.email}")
    return UserRead.model_validate(current_user)


@router.patch(
    "/me",
    status_code=status.HTTP_200_OK,
    response_model=UserRead,
    description="Update current user information",
    response_model_exclude_none=True,
)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> UserRead:
    """
    Update information for the currently authenticated user.
    
    Args:
        user_update: User update data
        current_user: Current authenticated user
        session: Database session
        
    Returns:
        UserRead: Updated user information
    """
    user_repo = UserRepository(session)
    
    update_data = user_update.model_dump(exclude_unset=True)
    updated_user = await user_repo. update(current_user.id, **update_data)
    
    logger.info(f"User updated: {updated_user.email}")
    
    return UserRead.model_validate(updated_user)


@router.get(
    "/all",
    status_code=status.HTTP_200_OK,
    response_model=List[UserRead],
    description="Get all users (admin only)",
    response_model_exclude_none=True,
)
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_superuser),
    session: AsyncSession = Depends(get_async_session),
) -> List[UserRead]:
    """
    Get list of all users. Only accessible by superusers.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        current_user: Current authenticated superuser
        session: Database session
        
    Returns:
        List[UserRead]: List of users
    """
    user_repo = UserRepository(session)
    
    users = await user_repo.list(skip=skip, limit=limit)
    
    logger.info(f"Admin {current_user.email} retrieved {len(users)} users")
    
    return [UserRead.model_validate(user) for user in users]


@router.get(
    "/{user_id}",
    status_code=status.HTTP_200_OK,
    response_model=UserRead,
    description="Get user by ID (admin only)",
    response_model_exclude_none=True,
)
async def get_user_by_id(
    user_id: UUID,
    current_user: User = Depends(get_current_superuser),
    session: AsyncSession = Depends(get_async_session),
) -> UserRead:
    """
    Get user information by ID. Only accessible by superusers.
    
    Args:
        user_id: User UUID
        current_user: Current authenticated superuser
        session: Database session
        
    Returns:
        UserRead: User information
        
    Raises:
        HTTPException: If user not found
    """
    user_repo = UserRepository(session)
    
    user = await user_repo. get(user_id)
    
    if not user:
        raise UserNotFoundError()
    
    logger.info(f"Admin {current_user.email} retrieved user: {user.email}")
    
    return UserRead.model_validate(user)


@router.patch(
    "/{user_id}",
    status_code=status.HTTP_200_OK,
    response_model=UserRead,
    description="Update user by ID (admin only)",
    response_model_exclude_none=True,
)
async def update_user_by_id(
    user_id: UUID,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_superuser),
    session: AsyncSession = Depends(get_async_session),
) -> UserRead:
    """
    Update user information by ID. Only accessible by superusers.
    
    Args:
        user_id: User UUID
        user_update: User update data
        current_user: Current authenticated superuser
        session: Database session
        
    Returns:
        UserRead: Updated user information
        
    Raises:
        HTTPException: If user not found
    """
    user_repo = UserRepository(session)
    
    user = await user_repo. get(user_id)
    
    if not user:
        raise UserNotFoundError()
    
    update_data = user_update.model_dump(exclude_unset=True)
    updated_user = await user_repo.update(user_id, **update_data)
    
    logger.info(f"Admin {current_user.email} updated user: {updated_user.email}")
    
    return UserRead.model_validate(updated_user)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Delete user by ID (admin only)",
)
async def delete_user_by_id(
    user_id: UUID,
    current_user: User = Depends(get_current_superuser),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Delete user by ID. Only accessible by superusers. 
    
    Args:
        user_id: User UUID
        current_user: Current authenticated superuser
        session: Database session
        
    Raises:
        HTTPException: If user not found or trying to delete self
    """
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user_repo = UserRepository(session)
    
    user = await user_repo.get(user_id)
    
    if not user:
        raise UserNotFoundError()
    
    await user_repo.delete(user_id)
    
    logger.info(f"Admin {current_user.email} deleted user: {user.email}")


# # Include FastAPI Users router
# router.include_router(
#     fastapi_users.get_users_router(UserRead, UserUpdate),
# )