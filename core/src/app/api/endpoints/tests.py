"""API endpoints for test management."""

import json
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.src.app.db.database import get_async_session
from core.src.app.api.deps import get_current_user_id
from core.src.app.schemas.course import (
    TestCreate,
    TestUpdate,
    TestResponse,
    TestWithQuestions,
    TestSubmission,
    TestResult,
    TestAttemptResponse,
    TestAnswerResult,
)
from core.src.app.repositories.course import (
    TestRepository,
    TestQuestionRepository,
    QuestionOptionRepository,
    TestAttemptRepository,
    TestAnswerRepository,
)

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


# Test Taking Endpoints

@router.post("/{test_id}/start", response_model=TestAttemptResponse, status_code=status.HTTP_201_CREATED)
async def start_test(
    test_id: int,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_async_session)
):
    """Start a new test attempt for the authenticated user."""
    from core.src.app.models.course import TestAttempt
    
    # Verify test exists
    test_repo = TestRepository(session)
    test = await test_repo.get(test_id)
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test with id {test_id} not found"
        )
    
    # Create new attempt
    attempt_repo = TestAttemptRepository(session)
    attempt = await attempt_repo.create(
        user_id=user_id,
        test_id=test_id,
        score=0,
        total_points=0,
        passed=False
    )
    
    return attempt


@router.post("/{test_id}/submit", response_model=TestResult)
async def submit_test(
    test_id: int,
    submission: TestSubmission,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_async_session)
):
    """Submit test answers and get results."""
    from core.src.app.models.course import TestAttempt, TestAnswer
    
    # Get test with questions and options
    test_repo = TestRepository(session)
    test = await test_repo.get_with_questions(test_id)
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test with id {test_id} not found"
        )
    
    # Create a new attempt
    attempt_repo = TestAttemptRepository(session)
    attempt = await attempt_repo.create(
        user_id=user_id,
        test_id=test_id,
        score=0,
        total_points=0,
        passed=False,
        started_at=datetime.now(timezone.utc)
    )
    
    # Process answers
    total_score = 0
    total_points = 0
    answer_results = []
    answer_repo = TestAnswerRepository(session)
    
    # Create a map of questions for quick lookup
    question_map = {q.id: q for q in test.questions}
    
    for answer_submit in submission.answers:
        question = question_map.get(answer_submit.question_id)
        if not question:
            continue
        
        total_points += question.points
        is_correct = False
        points_earned = 0
        
        # Check answer based on question type
        if question.question_type.value in ["single_choice", "multiple_choice"]:
            if answer_submit.selected_option_ids:
                # Get correct option IDs
                correct_option_ids = {opt.id for opt in question.options if opt.is_correct}
                selected_option_ids = set(answer_submit.selected_option_ids)
                
                # Check if answer is correct
                if correct_option_ids == selected_option_ids:
                    is_correct = True
                    points_earned = question.points
                    total_score += points_earned
        
        # Store the answer
        await answer_repo.create(
            attempt_id=attempt.id,
            question_id=question.id,
            selected_option_ids=json.dumps(answer_submit.selected_option_ids) if answer_submit.selected_option_ids else None,
            text_answer=answer_submit.text_answer,
            is_correct=is_correct,
            points_earned=points_earned
        )
        
        answer_results.append(TestAnswerResult(
            question_id=question.id,
            question_text=question.question_text,
            selected_option_ids=answer_submit.selected_option_ids,
            text_answer=answer_submit.text_answer,
            is_correct=is_correct,
            points_earned=points_earned,
            points_possible=question.points
        ))
    
    # Update attempt with results
    passed = total_score >= test.passing_score
    await attempt_repo.update(
        attempt.id,
        score=total_score,
        total_points=total_points,
        passed=passed,
        completed_at=datetime.now(timezone.utc)
    )
    
    return TestResult(
        attempt_id=attempt.id,
        test_id=test.id,
        test_title=test.title,
        score=total_score,
        total_points=total_points,
        passing_score=test.passing_score,
        passed=passed,
        started_at=attempt.started_at,
        completed_at=datetime.now(timezone.utc),
        answers=answer_results
    )


@router.get("/{test_id}/attempts", response_model=List[TestAttemptResponse])
async def get_test_attempts(
    test_id: int,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_async_session)
):
    """Get all attempts for a test by the authenticated user."""
    # Verify test exists
    test_repo = TestRepository(session)
    test = await test_repo.get(test_id)
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test with id {test_id} not found"
        )
    
    # Get attempts
    attempt_repo = TestAttemptRepository(session)
    attempts = await attempt_repo.get_by_user_and_test(user_id, test_id)
    
    return attempts


@router.get("/{test_id}/result/{attempt_id}", response_model=TestResult)
async def get_test_result(
    test_id: int,
    attempt_id: int,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_async_session)
):
    """Get detailed results for a specific test attempt."""
    # Get attempt with answers
    attempt_repo = TestAttemptRepository(session)
    attempt = await attempt_repo.get_with_answers(attempt_id)
    
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test attempt with id {attempt_id} not found"
        )
    
    # Verify user owns this attempt
    if attempt.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this attempt"
        )
    
    # Verify attempt belongs to the test
    if attempt.test_id != test_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attempt does not belong to this test"
        )
    
    # Get test details
    test_repo = TestRepository(session)
    test = await test_repo.get_with_questions(test_id)
    
    # Build answer results
    question_map = {q.id: q for q in test.questions}
    answer_results = []
    
    for answer in attempt.answers:
        question = question_map.get(answer.question_id)
        if not question:
            continue
        
        selected_ids = None
        if answer.selected_option_ids:
            try:
                selected_ids = json.loads(answer.selected_option_ids)
            except json.JSONDecodeError:
                pass
        
        answer_results.append(TestAnswerResult(
            question_id=answer.question_id,
            question_text=question.question_text,
            selected_option_ids=selected_ids,
            text_answer=answer.text_answer,
            is_correct=answer.is_correct,
            points_earned=answer.points_earned,
            points_possible=question.points
        ))
    
    return TestResult(
        attempt_id=attempt.id,
        test_id=test.id,
        test_title=test.title,
        score=attempt.score,
        total_points=attempt.total_points,
        passing_score=test.passing_score,
        passed=attempt.passed,
        started_at=attempt.started_at,
        completed_at=attempt.completed_at,
        answers=answer_results
    )
