"""API endpoints for test management."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.src.app.db.database import get_async_session
from core.src.app.schemas.course import (
    TestCreate,
    TestUpdate,
    TestResponse,
    TestWithQuestions,
)
from core.src.app.repositories.course import TestRepository

router = APIRouter(prefix="/tests", tags=["tests"])


@router.post("/", response_model=TestResponse, status_code=status.HTTP_201_CREATED)
async def create_test(
    test_data: TestCreate,
    session: AsyncSession = Depends(get_async_session)
):
    """Create a new test."""
    repository = TestRepository(session)
    test = await repository.create(**test_data.model_dump())
    return test


@router.get("/lesson/{lesson_id}", response_model=List[TestResponse])
async def get_tests_by_lesson(
    lesson_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get all tests for a specific lesson."""
    repository = TestRepository(session)
    tests = await repository.get_by_lesson(lesson_id)
    return tests


@router.get("/{test_id}", response_model=TestResponse)
async def get_test(
    test_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get a specific test by ID."""
    repository = TestRepository(session)
    test = await repository.get(test_id)
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test with id {test_id} not found"
        )
    return test


@router.get("/{test_id}/with-questions", response_model=TestWithQuestions)
async def get_test_with_questions(
    test_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get a test with its questions loaded."""
    repository = TestRepository(session)
    test = await repository.get_with_questions(test_id)
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test with id {test_id} not found"
        )
    return test


@router.put("/{test_id}", response_model=TestResponse)
async def update_test(
    test_id: int,
    test_data: TestUpdate,
    session: AsyncSession = Depends(get_async_session)
):
    """Update a test."""
    repository = TestRepository(session)
    update_data = test_data.model_dump(exclude_unset=True)
    test = await repository.update(test_id, **update_data)
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test with id {test_id} not found"
        )
    return test


@router.delete("/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_test(
    test_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Delete a test."""
    repository = TestRepository(session)
    deleted = await repository.delete(test_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test with id {test_id} not found"
        )
    return None
