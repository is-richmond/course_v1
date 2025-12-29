"""API endpoints for question options management."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.src.app.db.database import get_async_session
from core.src.app.schemas.course import (
    QuestionOptionCreate,
    QuestionOptionUpdate,
    QuestionOptionResponse,
)
from core.src.app.repositories.course import QuestionOptionRepository

router = APIRouter()


@router.post("/", response_model=QuestionOptionResponse, status_code=status.HTTP_201_CREATED)
async def create_option(
    option_data: QuestionOptionCreate,
    session: AsyncSession = Depends(get_async_session)
):
    """Create a new question option."""
    repository = QuestionOptionRepository(session)
    
    # Создаём опцию
    option = await repository.create(**option_data.model_dump())
    
    # Перезагружаем с медиа для корректной сериализации
    option_with_media = await repository.get_with_media(option.id)
    
    return option_with_media


@router.get("/", response_model=List[QuestionOptionResponse])
async def get_all_options(
    session: AsyncSession = Depends(get_async_session)
):
    """Get all options."""
    repository = QuestionOptionRepository(session)
    options = await repository.list()
    
    # Загружаем медиа для каждой опции
    options_with_media = []
    for option in options:
        option_with_media = await repository.get_with_media(option.id)
        if option_with_media:
            options_with_media.append(option_with_media)
    
    return options_with_media


@router.get("/question/{question_id}", response_model=List[QuestionOptionResponse])
async def get_question_options(
    question_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get all options for a specific question."""
    repository = QuestionOptionRepository(session)
    options = await repository.get_by_question_with_media(question_id)
    return options


@router.get("/{option_id}", response_model=QuestionOptionResponse)
async def get_option(
    option_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get a specific option by ID."""
    repository = QuestionOptionRepository(session)
    option = await repository.get_with_media(option_id)
    
    if not option:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Option with id {option_id} not found"
        )
    
    return option


@router.put("/{option_id}", response_model=QuestionOptionResponse)
async def update_option(
    option_id: int,
    option_data: QuestionOptionUpdate,
    session: AsyncSession = Depends(get_async_session)
):
    """Update a question option."""
    repository = QuestionOptionRepository(session)
    
    # Получаем опцию с медиа
    option = await repository.get_with_media(option_id)
    
    if not option:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Option with id {option_id} not found"
        )
    
    # Обновляем атрибуты
    update_data = option_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(option, key):
            setattr(option, key, value)
    
    await session.commit()
    await session.refresh(option)
    
    # Перезагружаем с медиа
    updated_option = await repository.get_with_media(option_id)
    
    return updated_option


@router.delete("/{option_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_option(
    option_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Delete a question option."""
    repository = QuestionOptionRepository(session)
    deleted = await repository.delete(option_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Option with id {option_id} not found"
        )
    
    return None


@router.get("/question/{question_id}/correct", response_model=List[QuestionOptionResponse])
async def get_correct_options(
    question_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get all correct options for a question."""
    repository = QuestionOptionRepository(session)
    options = await repository.get_correct_options(question_id)
    
    # Загружаем медиа для каждой опции
    options_with_media = []
    for option in options:
        option_with_media = await repository.get_with_media(option.id)
        if option_with_media:
            options_with_media.append(option_with_media)
    
    return options_with_media