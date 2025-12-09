"""Course models for the course platform."""

from datetime import datetime
from typing import Optional, List
from enum import Enum as PyEnum

from sqlalchemy import String, Text, BigInteger, Integer, Boolean, DateTime, Enum, ForeignKey, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.src.app.db.database import Base


class CourseStatus(str, PyEnum):
    """Course status enum."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class LessonType(str, PyEnum):
    """Lesson type enum."""
    THEORY = "theory"
    TEST = "test"
    PRACTICE = "practice"


class MediaType(str, PyEnum):
    """Media type enum."""
    IMAGE = "image"
    VIDEO = "video"
    DOCUMENT = "document"


class QuestionType(str, PyEnum):
    """Question type enum."""
    SINGLE_CHOICE = "single_choice"
    MULTIPLE_CHOICE = "multiple_choice"
    TEXT = "text"


class Course(Base):
    """Course model."""
    
    __tablename__ = "courses"
    __mapper_args__ = {"eager_defaults": False}
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    author_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    status: Mapped[CourseStatus] = mapped_column(
        Enum(CourseStatus, values_callable=lambda x: [e.value for e in x]), 
        default=CourseStatus.DRAFT, 
        nullable=False
    )
    price: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True, default=0.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        onupdate=func.now(),
        nullable=True
    )
    
    # Relationships
    modules: Mapped[List["CourseModule"]] = relationship(
        "CourseModule", 
        back_populates="course",
        cascade="all, delete-orphan"
    )
    user_progress: Mapped[List["UserProgress"]] = relationship(
        "UserProgress",
        back_populates="course",
        cascade="all, delete-orphan"
    )


class CourseModule(Base):
    """Course module/section model."""
    
    __tablename__ = "course_modules"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    course_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="modules")
    lessons: Mapped[List["Lesson"]] = relationship(
        "Lesson",
        back_populates="module",
        cascade="all, delete-orphan"
    )


class Lesson(Base):
    """Lesson/material model."""
    
    __tablename__ = "lessons"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    module_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("course_modules.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    lesson_type: Mapped[LessonType] = mapped_column(
        Enum(LessonType, values_callable=lambda x: [e.value for e in x]),
        default=LessonType.THEORY,
        nullable=False
    )
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # Relationships
    module: Mapped["CourseModule"] = relationship("CourseModule", back_populates="lessons")
    media: Mapped[List["LessonMedia"]] = relationship(
        "LessonMedia",
        back_populates="lesson",
        cascade="all, delete-orphan"
    )
    tests: Mapped[List["Test"]] = relationship(
        "Test",
        back_populates="lesson",
        cascade="all, delete-orphan"
    )
    user_progress: Mapped[List["UserProgress"]] = relationship(
        "UserProgress",
        back_populates="lesson",
        cascade="all, delete-orphan"
    )


class LessonMedia(Base):
    """Lesson media/file model."""
    
    __tablename__ = "lesson_media"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lesson_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    media_url: Mapped[str] = mapped_column(String(500), nullable=False)
    media_type: Mapped[MediaType] = mapped_column(
        Enum(MediaType, values_callable=lambda x: [e.value for e in x]),
        default=MediaType.IMAGE,
        nullable=False
    )
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # Relationships
    lesson: Mapped["Lesson"] = relationship("Lesson", back_populates="media")


class Test(Base):
    """Test model."""
    
    __tablename__ = "tests"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lesson_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    passing_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # Relationships
    lesson: Mapped["Lesson"] = relationship("Lesson", back_populates="tests")
    questions: Mapped[List["TestQuestion"]] = relationship(
        "TestQuestion",
        back_populates="test",
        cascade="all, delete-orphan"
    )


class TestQuestion(Base):
    """Test question model."""
    
    __tablename__ = "test_questions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    test_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tests.id", ondelete="CASCADE"), nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[QuestionType] = mapped_column(
        Enum(QuestionType, values_callable=lambda x: [e.value for e in x]),
        default=QuestionType.SINGLE_CHOICE,
        nullable=False
    )
    points: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # Relationships
    test: Mapped["Test"] = relationship("Test", back_populates="questions")
    options: Mapped[List["QuestionOption"]] = relationship(
        "QuestionOption",
        back_populates="question",
        cascade="all, delete-orphan"
    )


class QuestionOption(Base):
    """Question option/answer model."""
    
    __tablename__ = "question_options"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    question_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("test_questions.id", ondelete="CASCADE"), nullable=False)
    option_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    
    # Relationships
    question: Mapped["TestQuestion"] = relationship("TestQuestion", back_populates="options")


class UserProgress(Base):
    """User progress tracking model."""
    
    __tablename__ = "user_progress"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    course_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    lesson_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=True)
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    
    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="user_progress")
    lesson: Mapped[Optional["Lesson"]] = relationship("Lesson", back_populates="user_progress")


class TestAttempt(Base):
    """Test attempt tracking model."""
    
    __tablename__ = "test_attempts"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    test_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tests.id", ondelete="CASCADE"), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    passed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    
    # Relationships
    test: Mapped["Test"] = relationship("Test", backref="attempts")
    answers: Mapped[List["TestAnswer"]] = relationship(
        "TestAnswer",
        back_populates="attempt",
        cascade="all, delete-orphan"
    )


class TestAnswer(Base):
    """Test answer model for storing user answers."""
    
    __tablename__ = "test_answers"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    attempt_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("test_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("test_questions.id", ondelete="CASCADE"), nullable=False)
    selected_option_ids: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON array
    text_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_correct: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    points_earned: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # Relationships
    attempt: Mapped["TestAttempt"] = relationship("TestAttempt", back_populates="answers")
    question: Mapped["TestQuestion"] = relationship("TestQuestion", backref="answers")
