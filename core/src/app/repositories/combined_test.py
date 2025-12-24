"""Repository for combined test operations."""

from typing import List, Optional
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload

from core.src.app.models.combined_test import (
    CombinedTest,
    CombinedTestSource,
    CombinedTestQuestion,
    CombinedTestAttempt,
    CombinedTestAnswer,
)
from core.src.app.models.course import Test, TestQuestion
from core.src.app.repositories.base import BaseRepository


class CombinedTestRepository(BaseRepository[CombinedTest]):
    """Repository for CombinedTest operations."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(CombinedTest, session)
    
    async def get_user_tests(self, user_id: str) -> List[CombinedTest]:
        """Get all combined tests for a user."""
        stmt = (
            select(CombinedTest)
            .options(
                selectinload(CombinedTest.source_tests).joinedload(CombinedTestSource.source_test)
            )
            .where(CombinedTest.user_id == user_id)
            .order_by(CombinedTest.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.unique().scalars().all())
    
    async def get_with_questions(self, test_id: int) -> Optional[CombinedTest]:
        """Get combined test with all questions."""
        stmt = (
            select(CombinedTest)
            .options(
                selectinload(CombinedTest.questions).joinedload(CombinedTestQuestion.question).joinedload(TestQuestion.options),
                selectinload(CombinedTest.source_tests).joinedload(CombinedTestSource.source_test)
            )
            .where(CombinedTest.id == test_id)
        )
        result = await self.session.execute(stmt)
        return result.unique().scalar_one_or_none()


class CombinedTestSourceRepository(BaseRepository[CombinedTestSource]):
    """Repository for CombinedTestSource operations."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(CombinedTestSource, session)


class CombinedTestQuestionRepository(BaseRepository[CombinedTestQuestion]):
    """Repository for CombinedTestQuestion operations."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(CombinedTestQuestion, session)


class CombinedTestAttemptRepository(BaseRepository[CombinedTestAttempt]):
    """Repository for CombinedTestAttempt operations."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(CombinedTestAttempt, session)
    
    async def get_user_attempts(
        self, 
        user_id: str,  # Changed to str
        skip: int = 0,
        limit: int = 100
    ) -> List:
        """Get all attempts for a user."""
        from core.src.app.models.combined_test import CombinedTestAttempt
        stmt = (
            select(CombinedTestAttempt)
            .options(
                joinedload(CombinedTestAttempt.combined_test)
            )
            .where(CombinedTestAttempt.user_id == user_id)
            .order_by(CombinedTestAttempt.started_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.unique().scalars().all())
    
    async def get_with_answers(self, attempt_id: int):
        """Get attempt with all answers and related data."""
        from core.src.app.models.combined_test import CombinedTestAttempt, CombinedTestAnswer
        stmt = (
            select(CombinedTestAttempt)
            .options(
                joinedload(CombinedTestAttempt.combined_test).selectinload(CombinedTest.source_tests).joinedload(CombinedTestSource.source_test),
                selectinload(CombinedTestAttempt.answers).joinedload(CombinedTestAnswer.question).joinedload(TestQuestion.test)
            )
            .where(CombinedTestAttempt.id == attempt_id)
        )
        result = await self.session.execute(stmt)
        return result.unique().scalar_one_or_none()
    
    async def get_user_statistics(self, user_id: str) -> dict:  # Changed to str
        """Get overall statistics for a user."""
        # Get all completed attempts
        stmt = (
            select(CombinedTestAttempt)
            .options(
                selectinload(CombinedTestAttempt.answers).joinedload(CombinedTestAnswer.question).joinedload(TestQuestion.test)
            )
            .where(
                and_(
                    CombinedTestAttempt.user_id == user_id,
                    CombinedTestAttempt.completed_at.isnot(None)
                )
            )
        )
        result = await self.session.execute(stmt)
        attempts = list(result.unique().scalars().all())
        
        if not attempts:
            return {
                "total_attempts": 0,
                "total_questions": 0,
                "correct_answers": 0,
                "overall_percentage": 0.0,
                "best_score": None,
                "worst_score": None,
                "average_score": 0.0,
                "topics": []
            }
        
        # Calculate statistics
        total_attempts = len(attempts)
        total_questions = sum(a.total_questions for a in attempts)
        correct_answers = sum(a.score for a in attempts)
        scores = [a.score for a in attempts]
        
        # Topic statistics
        topic_stats = {}
        for attempt in attempts:
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
            {
                "test_id": stats["test_id"],
                "test_title": stats["test_title"],
                "total_questions_answered": stats["total"],
                "correct_answers": stats["correct"],
                "percentage": (stats["correct"] / stats["total"] * 100) if stats["total"] > 0 else 0.0
            }
            for stats in topic_stats.values()
        ]
        
        return {
            "total_attempts": total_attempts,
            "total_questions": total_questions,
            "correct_answers": correct_answers,
            "overall_percentage": (correct_answers / total_questions * 100) if total_questions > 0 else 0.0,
            "best_score": max(scores),
            "worst_score": min(scores),
            "average_score": sum(scores) / len(scores),
            "topics": topics
        }


class CombinedTestAnswerRepository(BaseRepository[CombinedTestAnswer]):
    """Repository for CombinedTestAnswer operations."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(CombinedTestAnswer, session)