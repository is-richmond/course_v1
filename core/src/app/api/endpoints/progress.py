"""API endpoints for user progress tracking."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.src.app.db.database import get_async_session
from core.src.app.schemas.course import (
    UserProgressCreate,
    UserProgressUpdate,
    UserProgressResponse,
)
from core.src.app.repositories.course import UserProgressRepository

router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("/", response_model=UserProgressResponse, status_code=status.HTTP_201_CREATED)
async def create_progress(
    progress_data: UserProgressCreate,
    session: AsyncSession = Depends(get_async_session)
):
    """Create a new user progress entry."""
    repository = UserProgressRepository(session)
    progress = await repository.create(**progress_data.model_dump())
    return progress


@router.get("/user/{user_id}/course/{course_id}", response_model=List[UserProgressResponse])
async def get_progress_by_user_and_course(
    user_id: int,
    course_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get all progress entries for a user in a specific course."""
    repository = UserProgressRepository(session)
    progress = await repository.get_by_user_and_course(user_id, course_id)
    return progress


@router.get("/{progress_id}", response_model=UserProgressResponse)
async def get_progress(
    progress_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get a specific progress entry by ID."""
    repository = UserProgressRepository(session)
    progress = await repository.get(progress_id)
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Progress with id {progress_id} not found"
        )
    return progress


@router.put("/{progress_id}", response_model=UserProgressResponse)
async def update_progress(
    progress_id: int,
    progress_data: UserProgressUpdate,
    session: AsyncSession = Depends(get_async_session)
):
    """Update a progress entry."""
    repository = UserProgressRepository(session)
    update_data = progress_data.model_dump(exclude_unset=True)
    progress = await repository.update(progress_id, **update_data)
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Progress with id {progress_id} not found"
        )
    return progress


@router.delete("/{progress_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_progress(
    progress_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Delete a progress entry."""
    repository = UserProgressRepository(session)
    deleted = await repository.delete(progress_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Progress with id {progress_id} not found"
        )
    return None
