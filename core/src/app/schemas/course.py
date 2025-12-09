"""Pydantic schemas for course models."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

from core.src.app.models.course import (
    CourseStatus,
    LessonType,
    MediaType,
    QuestionType
)


# Course Schemas
class CourseBase(BaseModel):
    """Base course schema."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    author_id: Optional[int] = None
    status: CourseStatus = CourseStatus.DRAFT
    price: Optional[float] = Field(default=0.0, ge=0)


class CourseCreate(CourseBase):
    """Schema for creating a course."""
    pass


class CourseUpdate(BaseModel):
    """Schema for updating a course."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    author_id: Optional[int] = None
    status: Optional[CourseStatus] = None
    price: Optional[float] = Field(None, ge=0)


class CourseResponse(CourseBase):
    """Schema for course response."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


# Course Module Schemas
class CourseModuleBase(BaseModel):
    """Base course module schema."""
    title: str = Field(..., min_length=1, max_length=255)
    order_index: int = Field(default=0, ge=0)


class CourseModuleCreate(CourseModuleBase):
    """Schema for creating a course module."""
    course_id: int


class CourseModuleUpdate(BaseModel):
    """Schema for updating a course module."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    order_index: Optional[int] = Field(None, ge=0)


class CourseModuleResponse(CourseModuleBase):
    """Schema for course module response."""
    id: int
    course_id: int
    
    model_config = ConfigDict(from_attributes=True)


# Lesson Schemas
class LessonBase(BaseModel):
    """Base lesson schema."""
    title: str = Field(..., min_length=1, max_length=255)
    content: Optional[str] = None
    lesson_type: LessonType = LessonType.THEORY
    order_index: int = Field(default=0, ge=0)


class LessonCreate(LessonBase):
    """Schema for creating a lesson."""
    module_id: int


class LessonUpdate(BaseModel):
    """Schema for updating a lesson."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None
    lesson_type: Optional[LessonType] = None
    order_index: Optional[int] = Field(None, ge=0)


class LessonResponse(LessonBase):
    """Schema for lesson response."""
    id: int
    module_id: int
    
    model_config = ConfigDict(from_attributes=True)


# Lesson Media Schemas
class LessonMediaBase(BaseModel):
    """Base lesson media schema."""
    media_url: str = Field(..., min_length=1, max_length=500)
    media_type: MediaType = MediaType.IMAGE
    order_index: int = Field(default=0, ge=0)


class LessonMediaCreate(LessonMediaBase):
    """Schema for creating lesson media."""
    lesson_id: int


class LessonMediaUpdate(BaseModel):
    """Schema for updating lesson media."""
    media_url: Optional[str] = Field(None, min_length=1, max_length=500)
    media_type: Optional[MediaType] = None
    order_index: Optional[int] = Field(None, ge=0)


class LessonMediaResponse(LessonMediaBase):
    """Schema for lesson media response."""
    id: int
    lesson_id: int
    
    model_config = ConfigDict(from_attributes=True)


# Test Schemas
class TestBase(BaseModel):
    """Base test schema."""
    title: str = Field(..., min_length=1, max_length=255)
    passing_score: int = Field(default=0, ge=0)


class TestCreate(TestBase):
    """Schema for creating a test."""
    lesson_id: int


class TestUpdate(BaseModel):
    """Schema for updating a test."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    passing_score: Optional[int] = Field(None, ge=0)


class TestResponse(TestBase):
    """Schema for test response."""
    id: int
    lesson_id: int
    
    model_config = ConfigDict(from_attributes=True)


# Test Question Schemas
class TestQuestionBase(BaseModel):
    """Base test question schema."""
    question_text: str = Field(..., min_length=1)
    question_type: QuestionType = QuestionType.SINGLE_CHOICE
    points: int = Field(default=1, ge=0)
    order_index: int = Field(default=0, ge=0)


class TestQuestionCreate(TestQuestionBase):
    """Schema for creating a test question."""
    test_id: int


class TestQuestionUpdate(BaseModel):
    """Schema for updating a test question."""
    question_text: Optional[str] = Field(None, min_length=1)
    question_type: Optional[QuestionType] = None
    points: Optional[int] = Field(None, ge=0)
    order_index: Optional[int] = Field(None, ge=0)


class TestQuestionResponse(TestQuestionBase):
    """Schema for test question response."""
    id: int
    test_id: int
    
    model_config = ConfigDict(from_attributes=True)


# Question Option Schemas
class QuestionOptionBase(BaseModel):
    """Base question option schema."""
    option_text: str = Field(..., min_length=1)
    is_correct: bool = False


class QuestionOptionCreate(QuestionOptionBase):
    """Schema for creating a question option."""
    question_id: int


class QuestionOptionUpdate(BaseModel):
    """Schema for updating a question option."""
    option_text: Optional[str] = Field(None, min_length=1)
    is_correct: Optional[bool] = None


class QuestionOptionResponse(QuestionOptionBase):
    """Schema for question option response."""
    id: int
    question_id: int
    
    model_config = ConfigDict(from_attributes=True)


# User Progress Schemas
class UserProgressBase(BaseModel):
    """Base user progress schema."""
    user_id: int
    course_id: int
    lesson_id: Optional[int] = None
    completed: bool = False


class UserProgressCreate(UserProgressBase):
    """Schema for creating user progress."""
    pass


class UserProgressUpdate(BaseModel):
    """Schema for updating user progress."""
    completed: Optional[bool] = None
    completed_at: Optional[datetime] = None


class UserProgressResponse(UserProgressBase):
    """Schema for user progress response."""
    id: int
    completed_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


# Extended Response Schemas with nested data
class LessonWithMedia(LessonResponse):
    """Lesson response with media."""
    media: List[LessonMediaResponse] = []


class TestWithQuestions(TestResponse):
    """Test response with questions and their options."""
    questions: List["QuestionWithOptions"] = []


class QuestionWithOptions(TestQuestionResponse):
    """Question response with options."""
    options: List[QuestionOptionResponse] = []


class ModuleWithLessons(CourseModuleResponse):
    """Module response with lessons."""
    lessons: List[LessonResponse] = []


class CourseWithModules(CourseResponse):
    """Course response with modules."""
    modules: List[CourseModuleResponse] = []


class CourseDetail(CourseResponse):
    """Detailed course response with nested data."""
    modules: List[ModuleWithLessons] = []


# Test Taking Schemas
class TestAnswerSubmit(BaseModel):
    """Schema for submitting an answer to a question."""
    question_id: int
    selected_option_ids: Optional[List[int]] = None  # For single/multiple choice
    text_answer: Optional[str] = None  # For text questions


class TestSubmission(BaseModel):
    """Schema for submitting a complete test."""
    answers: List[TestAnswerSubmit]


class TestAnswerResult(BaseModel):
    """Schema for test answer result."""
    question_id: int
    question_text: str
    selected_option_ids: Optional[List[int]] = None
    text_answer: Optional[str] = None
    is_correct: Optional[bool] = None
    points_earned: int
    points_possible: int
    
    model_config = ConfigDict(from_attributes=True)


class TestResult(BaseModel):
    """Schema for test result response."""
    attempt_id: int
    test_id: int
    test_title: str
    score: int
    total_points: int
    passing_score: int
    passed: bool
    started_at: datetime
    completed_at: Optional[datetime] = None
    answers: List[TestAnswerResult] = []
    
    model_config = ConfigDict(from_attributes=True)


class TestAttemptResponse(BaseModel):
    """Schema for test attempt response."""
    id: int
    user_id: int
    test_id: int
    score: int
    total_points: int
    passed: bool
    started_at: datetime
    completed_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)
