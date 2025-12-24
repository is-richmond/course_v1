"""Combined test models for user-generated tests."""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, BigInteger, Integer, Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.src.app.db.database import Base


class CombinedTest(Base):
    """User-generated test combining questions from multiple base tests."""
    
    __tablename__ = "combined_tests"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)  # Changed to String for UUID
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    total_questions: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    
    # Relationships
    questions: Mapped[List["CombinedTestQuestion"]] = relationship(
        "CombinedTestQuestion",
        back_populates="combined_test",
        cascade="all, delete-orphan"
    )
    attempts: Mapped[List["CombinedTestAttempt"]] = relationship(
        "CombinedTestAttempt",
        back_populates="combined_test",
        cascade="all, delete-orphan"
    )
    source_tests: Mapped[List["CombinedTestSource"]] = relationship(
        "CombinedTestSource",
        back_populates="combined_test",
        cascade="all, delete-orphan"
    )


class CombinedTestSource(Base):
    """Tracks which base tests were used to create a combined test."""
    
    __tablename__ = "combined_test_sources"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    combined_test_id: Mapped[int] = mapped_column(
        BigInteger, 
        ForeignKey("combined_tests.id", ondelete="CASCADE"), 
        nullable=False
    )
    source_test_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("tests.id", ondelete="CASCADE"),
        nullable=False
    )
    questions_count: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Relationships
    combined_test: Mapped["CombinedTest"] = relationship(
        "CombinedTest",
        back_populates="source_tests"
    )
    source_test: Mapped["Test"] = relationship("Test")


class CombinedTestQuestion(Base):
    """Links questions from base tests to combined tests."""
    
    __tablename__ = "combined_test_questions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    combined_test_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("combined_tests.id", ondelete="CASCADE"),
        nullable=False
    )
    question_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("test_questions.id", ondelete="CASCADE"),
        nullable=False
    )
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Relationships
    combined_test: Mapped["CombinedTest"] = relationship(
        "CombinedTest",
        back_populates="questions"
    )
    question: Mapped["TestQuestion"] = relationship("TestQuestion")


class CombinedTestAttempt(Base):
    """User attempt at a combined test."""
    
    __tablename__ = "combined_test_attempts"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    combined_test_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("combined_tests.id", ondelete="CASCADE"),
        nullable=False
    )
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)  # Changed to String for UUID
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_questions: Mapped[int] = mapped_column(Integer, nullable=False)
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
    combined_test: Mapped["CombinedTest"] = relationship(
        "CombinedTest",
        back_populates="attempts"
    )
    answers: Mapped[List["CombinedTestAnswer"]] = relationship(
        "CombinedTestAnswer",
        back_populates="attempt",
        cascade="all, delete-orphan"
    )


class CombinedTestAnswer(Base):
    """User answer for a combined test question."""
    
    __tablename__ = "combined_test_answers"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    attempt_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("combined_test_attempts.id", ondelete="CASCADE"),
        nullable=False
    )
    question_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("test_questions.id", ondelete="CASCADE"),
        nullable=False
    )
    selected_option_ids: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    text_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    points_earned: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # Relationships
    attempt: Mapped["CombinedTestAttempt"] = relationship(
        "CombinedTestAttempt",
        back_populates="answers"
    )
    question: Mapped["TestQuestion"] = relationship("TestQuestion")


# Import Test and TestQuestion to avoid circular imports
from core.src.app.models.course import Test, TestQuestion