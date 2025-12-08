"""API endpoints for lesson management."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.db.database import get_async_session
from src.app.schemas.course import (
    LessonCreate,
    LessonUpdate,
    LessonResponse,
    LessonWithMedia,
)
from src.app.repositories.course import LessonRepository

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.post("/", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
async def create_lesson(
    lesson_data: LessonCreate,
    session: AsyncSession = Depends(get_async_session)
):
    """Create a new lesson."""
    repository = LessonRepository(session)
    lesson = await repository.create(**lesson_data.model_dump())
    return lesson


@router.get("/module/{module_id}", response_model=List[LessonResponse])
async def get_lessons_by_module(
    module_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get all lessons for a specific module."""
    repository = LessonRepository(session)
    lessons = await repository.get_by_module(module_id)
    return lessons


@router.get("/{lesson_id}", response_model=LessonResponse)
async def get_lesson(
    lesson_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get a specific lesson by ID."""
    repository = LessonRepository(session)
    lesson = await repository.get(lesson_id)
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson with id {lesson_id} not found"
        )
    return lesson


@router.get("/{lesson_id}/with-media", response_model=LessonWithMedia)
async def get_lesson_with_media(
    lesson_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get a lesson with its media loaded."""
    repository = LessonRepository(session)
    lesson = await repository.get_with_media(lesson_id)
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson with id {lesson_id} not found"
        )
    return lesson


@router.put("/{lesson_id}", response_model=LessonResponse)
async def update_lesson(
    lesson_id: int,
    lesson_data: LessonUpdate,
    session: AsyncSession = Depends(get_async_session)
):
    """Update a lesson."""
    repository = LessonRepository(session)
    update_data = lesson_data.model_dump(exclude_unset=True)
    lesson = await repository.update(lesson_id, **update_data)
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson with id {lesson_id} not found"
        )
    return lesson


@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lesson(
    lesson_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Delete a lesson."""
    repository = LessonRepository(session)
    deleted = await repository.delete(lesson_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson with id {lesson_id} not found"
        )
    return None
