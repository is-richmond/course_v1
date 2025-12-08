"""API endpoints for lesson media management."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.src.app.db.database import get_async_session
from core.src.app.schemas.course import (
    LessonMediaCreate,
    LessonMediaUpdate,
    LessonMediaResponse,
)
from core.src.app.repositories.course import LessonMediaRepository

router = APIRouter(prefix="/media", tags=["media"])


@router.post("/", response_model=LessonMediaResponse, status_code=status.HTTP_201_CREATED)
async def create_media(
    media_data: LessonMediaCreate,
    session: AsyncSession = Depends(get_async_session)
):
    """Create a new lesson media entry."""
    repository = LessonMediaRepository(session)
    media = await repository.create(**media_data.model_dump())
    return media


@router.get("/lesson/{lesson_id}", response_model=List[LessonMediaResponse])
async def get_media_by_lesson(
    lesson_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get all media for a specific lesson."""
    repository = LessonMediaRepository(session)
    media = await repository.get_by_lesson(lesson_id)
    return media


@router.get("/{media_id}", response_model=LessonMediaResponse)
async def get_media(
    media_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get a specific media entry by ID."""
    repository = LessonMediaRepository(session)
    media = await repository.get(media_id)
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Media with id {media_id} not found"
        )
    return media


@router.put("/{media_id}", response_model=LessonMediaResponse)
async def update_media(
    media_id: int,
    media_data: LessonMediaUpdate,
    session: AsyncSession = Depends(get_async_session)
):
    """Update a media entry."""
    repository = LessonMediaRepository(session)
    update_data = media_data.model_dump(exclude_unset=True)
    media = await repository.update(media_id, **update_data)
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Media with id {media_id} not found"
        )
    return media


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(
    media_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Delete a media entry."""
    repository = LessonMediaRepository(session)
    deleted = await repository.delete(media_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Media with id {media_id} not found"
        )
    return None
