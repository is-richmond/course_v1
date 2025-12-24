"""API endpoints for combined tests."""

import json
import random
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.src.app.db.database import get_async_session
from core.src.app.api.deps import get_current_user_id
from core.src.app.schemas.combined_test import (
    CombinedTestGenerateRequest,
    CombinedTestResponse,
    CombinedTestDetailResponse,
    CombinedTestSubmission,
    CombinedTestResult,
    CombinedTestAttemptResponse,
    CombinedTestAttemptDetailResponse,
    OverallStatistics,
    AttemptTopicStatistics,
    CombinedTestSourceResponse,
    CombinedTestQuestionResponse,
    CombinedTestAnswerResult,
    TopicStatistics,
)
from core.src.app.repositories.combined_test import (
    CombinedTestRepository,
    CombinedTestSourceRepository,
    CombinedTestQuestionRepository,
    CombinedTestAttemptRepository,
    CombinedTestAnswerRepository,
)
from core.src.app.repositories.course import (
    TestRepository,
    TestQuestionRepository,
    QuestionOptionRepository,
)
from core.src.app.models.combined_test import (
    CombinedTest,
    CombinedTestSource,
    CombinedTestQuestion,
)
from core.src.app.models.course import TestQuestion

router = APIRouter()


@router.post("/generate", response_model=CombinedTestResponse, status_code=status.HTTP_201_CREATED)
async def generate_combined_test(
    request: CombinedTestGenerateRequest,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_async_session)
):
    """Generate a new combined test from selected base tests."""
    
    # Verify all source tests exist
    test_repo = TestRepository(session)
    source_tests = []
    for test_id in request.source_test_ids:
        test = await test_repo.get_with_questions(test_id)
        if not test:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Test with id {test_id} not found"
            )
        if not test.questions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Test '{test.title}' has no questions"
            )
        source_tests.append(test)
    
    # Calculate questions per test
    total_available = sum(len(test.questions) for test in source_tests)
    if request.questions_count > total_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not enough questions. Available: {total_available}, Requested: {request.questions_count}"
        )
    
    # Distribute questions proportionally
    questions_per_test = {}
    remaining = request.questions_count
    
    for i, test in enumerate(source_tests):
        available = len(test.questions)
        if i == len(source_tests) - 1:
            # Last test gets remaining questions
            count = min(remaining, available)
        else:
            # Proportional distribution
            proportion = available / total_available
            count = min(int(request.questions_count * proportion), available, remaining)
        
        questions_per_test[test.id] = count
        remaining -= count
    
    # If there are remaining questions, distribute them
    while remaining > 0:
        for test in source_tests:
            if remaining == 0:
                break
            if questions_per_test[test.id] < len(test.questions):
                questions_per_test[test.id] += 1
                remaining -= 1
    
    # Create combined test
    test_titles = " + ".join([test.title for test in source_tests])
    combined_test = CombinedTest(
        user_id=user_id,
        title=f"Combined Test: {test_titles}",
        total_questions=request.questions_count
    )
    session.add(combined_test)
    await session.flush()
    
    # Add source test records
    for test in source_tests:
        source = CombinedTestSource(
            combined_test_id=combined_test.id,
            source_test_id=test.id,
            questions_count=questions_per_test[test.id]
        )
        session.add(source)
    
    # Select random questions from each test
    selected_questions = []
    for test in source_tests:
        count = questions_per_test[test.id]
        test_questions = random.sample(test.questions, count)
        selected_questions.extend(test_questions)
    
    # Shuffle all selected questions
    random.shuffle(selected_questions)
    
    # Add questions to combined test
    for idx, question in enumerate(selected_questions):
        ctq = CombinedTestQuestion(
            combined_test_id=combined_test.id,
            question_id=question.id,
            order_index=idx
        )
        session.add(ctq)
    
    await session.commit()
    await session.refresh(combined_test)
    
    # Build response
    combined_test_repo = CombinedTestRepository(session)
    test_with_sources = await combined_test_repo.get_with_questions(combined_test.id)
    
    source_responses = [
        CombinedTestSourceResponse(
            source_test_id=source.source_test_id,
            source_test_title=source.source_test.title,
            questions_count=source.questions_count
        )
        for source in test_with_sources.source_tests
    ]
    
    return CombinedTestResponse(
        id=test_with_sources.id,
        user_id=test_with_sources.user_id,
        title=test_with_sources.title,
        total_questions=test_with_sources.total_questions,
        created_at=test_with_sources.created_at,
        source_tests=source_responses
    )


@router.get("/my-tests", response_model=List[CombinedTestResponse])
async def get_my_combined_tests(
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_async_session)
):
    """Get all combined tests created by the current user."""
    repo = CombinedTestRepository(session)
    tests = await repo.get_user_tests(user_id)
    
    return [
        CombinedTestResponse(
            id=test.id,
            user_id=test.user_id,
            title=test.title,
            total_questions=test.total_questions,
            created_at=test.created_at,
            source_tests=[
                CombinedTestSourceResponse(
                    source_test_id=source.source_test_id,
                    source_test_title=source.source_test.title,
                    questions_count=source.questions_count
                )
                for source in test.source_tests
            ]
        )
        for test in tests
    ]


@router.get("/{test_id}", response_model=CombinedTestDetailResponse)
async def get_combined_test(
    test_id: int,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_async_session)
):
    """Get a combined test with all questions."""
    repo = CombinedTestRepository(session)
    test = await repo.get_with_questions(test_id)
    
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Combined test with id {test_id} not found"
        )
    
    if test.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this test"
        )
    
    # Build question responses
    questions = []
    for ctq in sorted(test.questions, key=lambda x: x.order_index):
        questions.append(
            CombinedTestQuestionResponse(
                id=ctq.id,
                question_id=ctq.question_id,
                order_index=ctq.order_index,
                question_text=ctq.question.question_text,
                question_type=ctq.question.question_type.value,
                points=ctq.question.points,
                source_test_title=ctq.question.test.title
            )
        )
    
    source_responses = [
        CombinedTestSourceResponse(
            source_test_id=source.source_test_id,
            source_test_title=source.source_test.title,
            questions_count=source.questions_count
        )
        for source in test.source_tests
    ]
    
    return CombinedTestDetailResponse(
        id=test.id,
        user_id=test.user_id,
        title=test.title,
        total_questions=test.total_questions,
        created_at=test.created_at,
        source_tests=source_responses,
        questions=questions
    )


@router.post("/{test_id}/submit", response_model=CombinedTestResult)
async def submit_combined_test(
    test_id: int,
    submission: CombinedTestSubmission,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_async_session)
):
    """Submit answers for a combined test."""
    
    # Get combined test with questions
    combined_repo = CombinedTestRepository(session)
    combined_test = await combined_repo.get_with_questions(test_id)
    
    if not combined_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Combined test with id {test_id} not found"
        )
    
    if combined_test.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this test"
        )
    
    # Create attempt
    attempt_repo = CombinedTestAttemptRepository(session)
    attempt = await attempt_repo.create(
        combined_test_id=test_id,
        user_id=user_id,
        score=0,
        total_questions=combined_test.total_questions,
        started_at=datetime.now(timezone.utc)
    )
    
    # Process answers
    score = 0
    answer_results = []
    answer_repo = CombinedTestAnswerRepository(session)
    
    # Create question map
    question_map = {ctq.question_id: ctq.question for ctq in combined_test.questions}
    
    for answer_submit in submission.answers:
        question = question_map.get(answer_submit.question_id)
        if not question:
            continue
        
        is_correct = False
        points_earned = 0
        
        # Check answer based on question type
        if question.question_type.value in ["single_choice", "multiple_choice"]:
            if answer_submit.selected_option_ids:
                correct_option_ids = {opt.id for opt in question.options if opt.is_correct}
                selected_option_ids = set(answer_submit.selected_option_ids)
                
                if correct_option_ids == selected_option_ids:
                    is_correct = True
                    points_earned = question.points
                    score += points_earned
        
        # Save answer
        await answer_repo.create(
            attempt_id=attempt.id,
            question_id=question.id,
            selected_option_ids=json.dumps(answer_submit.selected_option_ids) if answer_submit.selected_option_ids else None,
            text_answer=answer_submit.text_answer,
            is_correct=is_correct,
            points_earned=points_earned
        )
        
        answer_results.append(
            CombinedTestAnswerResult(
                question_id=question.id,
                question_text=question.question_text,
                source_test_title=question.test.title,
                selected_option_ids=answer_submit.selected_option_ids,
                text_answer=answer_submit.text_answer,
                is_correct=is_correct,
                points_earned=points_earned,
                points_possible=question.points
            )
        )
    
    # Update attempt
    completed_at = datetime.now(timezone.utc)
    await attempt_repo.update(
        attempt.id,
        score=score,
        completed_at=completed_at
    )
    
    percentage = (score / combined_test.total_questions * 100) if combined_test.total_questions > 0 else 0.0
    
    return CombinedTestResult(
        attempt_id=attempt.id,
        combined_test_id=test_id,
        score=score,
        total_questions=combined_test.total_questions,
        percentage=percentage,
        started_at=attempt.started_at,
        completed_at=completed_at,
        answers=answer_results
    )


@router.get("/attempts/history", response_model=List[CombinedTestAttemptResponse])
async def get_attempts_history(
    skip: int = 0,
    limit: int = 100,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_async_session)
):
    """Get all test attempts for the current user."""
    repo = CombinedTestAttemptRepository(session)
    attempts = await repo.get_user_attempts(user_id, skip, limit)
    
    return [
        CombinedTestAttemptResponse(
            id=attempt.id,
            combined_test_id=attempt.combined_test_id,
            combined_test_title=attempt.combined_test.title,
            user_id=attempt.user_id,
            score=attempt.score,
            total_questions=attempt.total_questions,
            percentage=(attempt.score / attempt.total_questions * 100) if attempt.total_questions > 0 else 0.0,
            started_at=attempt.started_at,
            completed_at=attempt.completed_at
        )
        for attempt in attempts
    ]


@router.get("/attempts/{attempt_id}", response_model=CombinedTestAttemptDetailResponse)
async def get_attempt_details(
    attempt_id: int,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_async_session)
):
    """Get detailed information about a specific attempt."""
    repo = CombinedTestAttemptRepository(session)
    attempt = await repo.get_with_answers(attempt_id)
    
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attempt with id {attempt_id} not found"
        )
    
    if attempt.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this attempt"
        )
    
    # Build answer results
    answers = []
    for answer in attempt.answers:
        selected_ids = None
        if answer.selected_option_ids:
            try:
                selected_ids = json.loads(answer.selected_option_ids)
            except json.JSONDecodeError:
                pass
        
        answers.append(
            CombinedTestAnswerResult(
                question_id=answer.question_id,
                question_text=answer.question.question_text,
                source_test_title=answer.question.test.title,
                selected_option_ids=selected_ids,
                text_answer=answer.text_answer,
                is_correct=answer.is_correct,
                points_earned=answer.points_earned,
                points_possible=answer.question.points
            )
        )
    
    source_responses = [
        CombinedTestSourceResponse(
            source_test_id=source.source_test_id,
            source_test_title=source.source_test.title,
            questions_count=source.questions_count
        )
        for source in attempt.combined_test.source_tests
    ]
    
    return CombinedTestAttemptDetailResponse(
        id=attempt.id,
        combined_test_id=attempt.combined_test_id,
        combined_test_title=attempt.combined_test.title,
        user_id=attempt.user_id,
        score=attempt.score,
        total_questions=attempt.total_questions,
        percentage=(attempt.score / attempt.total_questions * 100) if attempt.total_questions > 0 else 0.0,
        started_at=attempt.started_at,
        completed_at=attempt.completed_at,
        answers=answers,
        source_tests=source_responses
    )


@router.get("/statistics/attempt/{attempt_id}", response_model=AttemptTopicStatistics)
async def get_attempt_statistics(
    attempt_id: int,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_async_session)
):
    """Get topic statistics for a specific attempt."""
    repo = CombinedTestAttemptRepository(session)
    attempt = await repo.get_with_answers(attempt_id)
    
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attempt with id {attempt_id} not found"
        )
    
    if attempt.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this attempt"
        )
    
    # Calculate topic statistics
    topic_stats = {}
    for answer in attempt.answers:
        test_id = answer.question.test_id
        test_title = answer.question.test.title
        
        if test_id not in topic_stats:
            topic_stats[test_id] = {
                "test_id": test_id,
                "test_title": test_title,
                "total": 0,
                "correct": 0
            }
        
        topic_stats[test_id]["total"] += 1
        if answer.is_correct:
            topic_stats[test_id]["correct"] += 1
    
    topics = [
        TopicStatistics(
            test_id=stats["test_id"],
            test_title=stats["test_title"],
            total_questions_answered=stats["total"],
            correct_answers=stats["correct"],
            percentage=(stats["correct"] / stats["total"] * 100) if stats["total"] > 0 else 0.0
        )
        for stats in topic_stats.values()
    ]
    
    return AttemptTopicStatistics(
        attempt_id=attempt.id,
        combined_test_title=attempt.combined_test.title,
        started_at=attempt.started_at,
        completed_at=attempt.completed_at,
        topics=topics
    )


@router.get("/statistics/overall", response_model=OverallStatistics)
async def get_overall_statistics(
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_async_session)
):
    """Get overall statistics across all attempts."""
    repo = CombinedTestAttemptRepository(session)
    stats = await repo.get_user_statistics(user_id)
    
    topics = [
        TopicStatistics(**topic)
        for topic in stats["topics"]
    ]
    
    return OverallStatistics(
        total_attempts=stats["total_attempts"],
        total_questions_answered=stats["total_questions"],
        total_correct_answers=stats["correct_answers"],
        overall_percentage=stats["overall_percentage"],
        best_attempt_score=stats["best_score"],
        worst_attempt_score=stats["worst_score"],
        average_score=stats["average_score"],
        topics=topics
    )


@router.delete("/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_combined_test(
    test_id: int,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_async_session)
):
    """Delete a combined test."""
    repo = CombinedTestRepository(session)
    test = await repo.get(test_id)
    
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Combined test with id {test_id} not found"
        )
    
    if test.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this test"
        )
    
    await repo.delete(test_id)
    return None