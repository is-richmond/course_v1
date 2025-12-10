"""API endpoints for question option management."""

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
    option = await repository.create(**option_data.model_dump())
    return option


@router.get("/question/{question_id}", response_model=List[QuestionOptionResponse])
async def get_options_by_question(
    question_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get all options for a specific question."""
    repository = QuestionOptionRepository(session)
    options = await repository.get_by_question(question_id)
    return options


@router.get("/{option_id}", response_model=QuestionOptionResponse)
async def get_option(
    option_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get a specific option by ID."""
    repository = QuestionOptionRepository(session)
    option = await repository.get(option_id)
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
    update_data = option_data.model_dump(exclude_unset=True)
    option = await repository.update(option_id, **update_data)
    if not option:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Option with id {option_id} not found"
        )
    return option


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
