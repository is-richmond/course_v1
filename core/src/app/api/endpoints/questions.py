"""API endpoints for test question management."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.src.app.db.database import get_async_session
from core.src.app.schemas.course import (
    TestQuestionCreate,
    TestQuestionUpdate,
    TestQuestionResponse,
    QuestionWithOptions,
)
from core.src.app.repositories.course import TestQuestionRepository

router = APIRouter(prefix="/questions", tags=["questions"])


@router.post("/", response_model=TestQuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    question_data: TestQuestionCreate,
    session: AsyncSession = Depends(get_async_session)
):
    """Create a new test question."""
    repository = TestQuestionRepository(session)
    question = await repository.create(**question_data.model_dump())
    return question


@router.get("/test/{test_id}", response_model=List[TestQuestionResponse])
async def get_questions_by_test(
    test_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get all questions for a specific test."""
    repository = TestQuestionRepository(session)
    questions = await repository.get_by_test(test_id)
    return questions


@router.get("/{question_id}", response_model=TestQuestionResponse)
async def get_question(
    question_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get a specific question by ID."""
    repository = TestQuestionRepository(session)
    question = await repository.get(question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with id {question_id} not found"
        )
    return question


@router.get("/{question_id}/with-options", response_model=QuestionWithOptions)
async def get_question_with_options(
    question_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get a question with its options loaded."""
    repository = TestQuestionRepository(session)
    question = await repository.get_with_options(question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with id {question_id} not found"
        )
    return question


@router.put("/{question_id}", response_model=TestQuestionResponse)
async def update_question(
    question_id: int,
    question_data: TestQuestionUpdate,
    session: AsyncSession = Depends(get_async_session)
):
    """Update a test question."""
    repository = TestQuestionRepository(session)
    update_data = question_data.model_dump(exclude_unset=True)
    question = await repository.update(question_id, **update_data)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with id {question_id} not found"
        )
    return question


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Delete a test question."""
    repository = TestQuestionRepository(session)
    deleted = await repository.delete(question_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with id {question_id} not found"
        )
    return None
