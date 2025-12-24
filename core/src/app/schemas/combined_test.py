"""Schemas for combined tests."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


# Base Schemas
class CombinedTestGenerateRequest(BaseModel):
    """Request to generate a combined test."""
    source_test_ids: List[int] = Field(..., min_length=1, max_length=10)
    questions_count: int = Field(..., ge=1, le=40)


class CombinedTestSourceResponse(BaseModel):
    """Response for source test info."""
    source_test_id: int
    source_test_title: str
    questions_count: int
    
    model_config = ConfigDict(from_attributes=True)


class CombinedTestResponse(BaseModel):
    """Response for combined test."""
    id: int
    user_id: str
    title: str
    total_questions: int
    created_at: datetime
    source_tests: List[CombinedTestSourceResponse] = []
    
    model_config = ConfigDict(from_attributes=True)


class CombinedTestQuestionResponse(BaseModel):
    """Response for combined test question."""
    id: int
    question_id: int
    order_index: int
    question_text: str
    question_type: str
    points: int
    source_test_title: str
    
    model_config = ConfigDict(from_attributes=True)


class CombinedTestDetailResponse(BaseModel):
    """Detailed response for combined test with questions."""
    id: int
    user_id: str
    title: str
    total_questions: int
    created_at: datetime
    source_tests: List[CombinedTestSourceResponse] = []
    questions: List[CombinedTestQuestionResponse] = []
    
    model_config = ConfigDict(from_attributes=True)


# Test Taking Schemas
class CombinedTestAnswerSubmit(BaseModel):
    """Schema for submitting an answer."""
    question_id: int
    selected_option_ids: Optional[List[int]] = None
    text_answer: Optional[str] = None


class CombinedTestSubmission(BaseModel):
    """Schema for submitting complete test."""
    answers: List[CombinedTestAnswerSubmit]


class CombinedTestAnswerResult(BaseModel):
    """Result for a single answer."""
    question_id: int
    question_text: str
    source_test_title: str
    selected_option_ids: Optional[List[int]] = None
    text_answer: Optional[str] = None
    is_correct: bool
    points_earned: int
    points_possible: int
    
    model_config = ConfigDict(from_attributes=True)


class CombinedTestResult(BaseModel):
    """Result of a completed test."""
    attempt_id: int
    combined_test_id: int
    score: int
    total_questions: int
    percentage: float
    started_at: datetime
    completed_at: datetime
    answers: List[CombinedTestAnswerResult] = []
    
    model_config = ConfigDict(from_attributes=True)


# Attempt Schemas
class CombinedTestAttemptResponse(BaseModel):
    """Response for test attempt."""
    id: int
    combined_test_id: int
    combined_test_title: str
    user_id: str
    score: int
    total_questions: int
    percentage: float
    started_at: datetime
    completed_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class CombinedTestAttemptDetailResponse(BaseModel):
    """Detailed response for attempt with answers."""
    id: int
    combined_test_id: int
    combined_test_title: str
    user_id: str
    score: int
    total_questions: int
    percentage: float
    started_at: datetime
    completed_at: Optional[datetime] = None
    answers: List[CombinedTestAnswerResult] = []
    source_tests: List[CombinedTestSourceResponse] = []
    
    model_config = ConfigDict(from_attributes=True)


# Statistics Schemas
class TopicStatistics(BaseModel):
    """Statistics for a specific topic (test)."""
    test_id: int
    test_title: str
    total_questions_answered: int
    correct_answers: int
    percentage: float


class AttemptTopicStatistics(BaseModel):
    """Topic statistics for a specific attempt."""
    attempt_id: int
    combined_test_title: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    topics: List[TopicStatistics]


class OverallTopicStatistics(BaseModel):
    """Overall statistics across all attempts."""
    total_attempts: int
    topics: List[TopicStatistics]


class OverallStatistics(BaseModel):
    """Overall user statistics."""
    total_attempts: int
    total_questions_answered: int
    total_correct_answers: int
    overall_percentage: float
    best_attempt_score: Optional[int] = None
    worst_attempt_score: Optional[int] = None
    average_score: float
    topics: List[TopicStatistics]
    
    model_config = ConfigDict(from_attributes=True)