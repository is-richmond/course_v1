"""Repository for course-related database operations."""

from typing import List, Optional
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.src.app.models.course import (
    Course,
    CourseModule,
    Lesson,
    LessonMedia,
    Test,
    TestQuestion,
    QuestionOption,
    UserProgress
)
from core.src.app.repositories.base import BaseRepository


class CourseRepository(BaseRepository[Course]):
    """Repository for Course model."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(Course, session)
    
    async def get_with_modules(self, course_id: int) -> Optional[Course]:
        """Get course with modules loaded."""
        stmt = (
            select(Course)
            .options(selectinload(Course.modules))
            .where(Course.id == course_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_by_author(self, author_id: int) -> List[Course]:
        """Get all courses by author."""
        stmt = select(Course).where(Course.author_id == author_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())


class CourseModuleRepository(BaseRepository[CourseModule]):
    """Repository for CourseModule model."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(CourseModule, session)
    
    async def get_by_course(self, course_id: int) -> List[CourseModule]:
        """Get all modules for a course."""
        stmt = (
            select(CourseModule)
            .where(CourseModule.course_id == course_id)
            .order_by(CourseModule.order_index)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
    
    async def get_with_lessons(self, module_id: int) -> Optional[CourseModule]:
        """Get module with lessons loaded."""
        stmt = (
            select(CourseModule)
            .options(selectinload(CourseModule.lessons))
            .where(CourseModule.id == module_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()


class LessonRepository(BaseRepository[Lesson]):
    """Repository for Lesson model."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(Lesson, session)
    
    async def get_by_module(self, module_id: int) -> List[Lesson]:
        """Get all lessons for a module."""
        stmt = (
            select(Lesson)
            .where(Lesson.module_id == module_id)
            .order_by(Lesson.order_index)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
    
    async def get_with_media(self, lesson_id: int) -> Optional[Lesson]:
        """Get lesson with media loaded."""
        stmt = (
            select(Lesson)
            .options(selectinload(Lesson.media))
            .where(Lesson.id == lesson_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_with_tests(self, lesson_id: int) -> Optional[Lesson]:
        """Get lesson with tests loaded."""
        stmt = (
            select(Lesson)
            .options(selectinload(Lesson.tests))
            .where(Lesson.id == lesson_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()


class LessonMediaRepository(BaseRepository[LessonMedia]):
    """Repository for LessonMedia model."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(LessonMedia, session)
    
    async def get_by_lesson(self, lesson_id: int) -> List[LessonMedia]:
        """Get all media for a lesson."""
        stmt = (
            select(LessonMedia)
            .where(LessonMedia.lesson_id == lesson_id)
            .order_by(LessonMedia.order_index)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())


class TestRepository(BaseRepository[Test]):
    """Repository for Test model."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(Test, session)
    
    async def get_by_lesson(self, lesson_id: int) -> List[Test]:
        """Get all tests for a lesson."""
        stmt = select(Test).where(Test.lesson_id == lesson_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
    
    async def get_with_questions(self, test_id: int) -> Optional[Test]:
        """Get test with questions loaded."""
        stmt = (
            select(Test)
            .options(selectinload(Test.questions))
            .where(Test.id == test_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()


class TestQuestionRepository(BaseRepository[TestQuestion]):
    """Repository for TestQuestion model."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(TestQuestion, session)
    
    async def get_by_test(self, test_id: int) -> List[TestQuestion]:
        """Get all questions for a test."""
        stmt = (
            select(TestQuestion)
            .where(TestQuestion.test_id == test_id)
            .order_by(TestQuestion.order_index)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
    
    async def get_with_options(self, question_id: int) -> Optional[TestQuestion]:
        """Get question with options loaded."""
        stmt = (
            select(TestQuestion)
            .options(selectinload(TestQuestion.options))
            .where(TestQuestion.id == question_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()


class QuestionOptionRepository(BaseRepository[QuestionOption]):
    """Repository for QuestionOption model."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(QuestionOption, session)
    
    async def get_by_question(self, question_id: int) -> List[QuestionOption]:
        """Get all options for a question."""
        stmt = select(QuestionOption).where(QuestionOption.question_id == question_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
    
    async def get_correct_options(self, question_id: int) -> List[QuestionOption]:
        """Get all correct options for a question."""
        stmt = select(QuestionOption).where(
            and_(
                QuestionOption.question_id == question_id,
                QuestionOption.is_correct == True
            )
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())


class UserProgressRepository(BaseRepository[UserProgress]):
    """Repository for UserProgress model."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(UserProgress, session)
    
    async def get_by_user_and_course(self, user_id: int, course_id: int) -> List[UserProgress]:
        """Get all progress records for a user in a course."""
        stmt = select(UserProgress).where(
            and_(
                UserProgress.user_id == user_id,
                UserProgress.course_id == course_id
            )
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
    
    async def get_by_user_and_lesson(
        self, user_id: int, lesson_id: int
    ) -> Optional[UserProgress]:
        """Get progress record for a user and specific lesson."""
        stmt = select(UserProgress).where(
            and_(
                UserProgress.user_id == user_id,
                UserProgress.lesson_id == lesson_id
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
