"""API endpoints for accessing Bot database data."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, and_, or_, desc, Integer, cast
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import date, datetime, timedelta
from core.src.app.api.deps import get_bot_db_session

import sys
from pathlib import Path
project_root = Path(__file__).resolve().parent.parent.parent.parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))


from bot.src.models.homework_model import UserHomework, UserStreak, UserGuarantee
from bot.src.models.reminder_types_model import ReminderType, ReminderMessagePool

from core.src.app.api.deps import get_db_session
from core.src.app.schemas.bot_data import (
    UserHomeworkResponse,
    UserStreakResponse,
    UserGuaranteeResponse,
    HomeworkStatistics,
    ReminderTypeResponse,
    ReminderMessageResponse,
)

router = APIRouter()


# ========== HOMEWORK DATA ==========

@router.get("/homework/user/{user_id}", response_model=List[UserHomeworkResponse])
async def get_user_homework(
    user_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    completed_only: Optional[bool] = None,
    db: AsyncSession = Depends(get_bot_db_session),
):
    """Get homework submissions for a specific user."""
    
    query = select(UserHomework).where(UserHomework.user_id == user_id)
    
    if start_date:
        query = query.where(UserHomework.date >= start_date)
    if end_date:
        query = query.where(UserHomework.date <= end_date)
    if completed_only is not None:
        query = query.where(UserHomework.is_complete == completed_only)
    
    query = query.order_by(desc(UserHomework.date)).offset(skip).limit(limit)
    
    result = await db.execute(query)
    homework_list = result.scalars().all()
    
    return [UserHomeworkResponse.model_validate(hw) for hw in homework_list]


@router.get("/homework/date/{homework_date}", response_model=List[UserHomeworkResponse])
async def get_homework_by_date(
    homework_date: date,
    db: AsyncSession = Depends(get_bot_db_session),
):
    """Get all homework submissions for a specific date."""
    
    query = select(UserHomework).where(UserHomework.date == homework_date)
    result = await db.execute(query)
    homework_list = result.scalars().all()
    
    return [UserHomeworkResponse.model_validate(hw) for hw in homework_list]


@router.get("/homework/statistics", response_model=HomeworkStatistics)
async def get_homework_statistics(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_bot_db_session),
):
    """Get homework completion statistics."""
    
    query = select(UserHomework)
    
    if start_date:
        query = query.where(UserHomework.date >= start_date)
    if end_date:
        query = query.where(UserHomework.date <= end_date)
    
    result = await db.execute(query)
    all_homework = result.scalars().all()
    
    total_submissions = len(all_homework)
    completed_submissions = sum(1 for hw in all_homework if hw.is_complete)
    
    anki_completed = sum(1 for hw in all_homework if hw.anki_submitted)
    test_completed = sum(1 for hw in all_homework if hw.test_submitted)
    lesson_completed = sum(1 for hw in all_homework if hw.lesson_submitted)
    
    unique_users = len(set(hw.user_id for hw in all_homework))
    
    completion_rate = (completed_submissions / total_submissions * 100) if total_submissions > 0 else 0
    
    return HomeworkStatistics(
        total_submissions=total_submissions,
        completed_submissions=completed_submissions,
        completion_rate=completion_rate,
        anki_completed=anki_completed,
        test_completed=test_completed,
        lesson_completed=lesson_completed,
        unique_users=unique_users,
        date_range_start=start_date,
        date_range_end=end_date,
    )


# ========== STREAK DATA ==========

@router.get("/streaks/user/{user_id}", response_model=UserStreakResponse)
async def get_user_streak(
    user_id: str,
    db: AsyncSession = Depends(get_bot_db_session),
):
    """Get streak information for a specific user."""
    
    query = select(UserStreak).where(UserStreak.user_id == user_id)
    result = await db.execute(query)
    streak = result.scalar_one_or_none()
    
    if not streak:
        raise HTTPException(status_code=404, detail="Streak data not found for user")
    
    return UserStreakResponse.model_validate(streak)


@router.get("/streaks/leaderboard", response_model=List[UserStreakResponse])
async def get_streak_leaderboard(
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_bot_db_session),
):
    """Get top users by current streak."""
    
    query = (
        select(UserStreak)
        .order_by(desc(UserStreak.current_streak))
        .limit(limit)
    )
    
    result = await db.execute(query)
    streaks = result.scalars().all()
    
    return [UserStreakResponse.model_validate(s) for s in streaks]


@router.get("/streaks/all", response_model=List[UserStreakResponse])
async def get_all_streaks(
    min_streak: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_bot_db_session),
):
    """Get all user streaks with optional minimum filter."""
    
    query = select(UserStreak)
    
    if min_streak > 0:
        query = query.where(UserStreak.current_streak >= min_streak)
    
    query = query.order_by(desc(UserStreak.current_streak))
    
    result = await db.execute(query)
    streaks = result.scalars().all()
    
    return [UserStreakResponse.model_validate(s) for s in streaks]


# ========== GUARANTEE DATA ==========

@router.get("/guarantee/user/{user_id}", response_model=UserGuaranteeResponse)
async def get_user_guarantee(
    user_id: str,
    db: AsyncSession = Depends(get_bot_db_session),
):
    """Get guarantee status for a specific user."""
    
    query = select(UserGuarantee).where(UserGuarantee.user_id == user_id)
    result = await db.execute(query)
    guarantee = result.scalar_one_or_none()
    
    if not guarantee:
        raise HTTPException(status_code=404, detail="Guarantee data not found for user")
    
    return UserGuaranteeResponse.model_validate(guarantee)


@router.get("/guarantee/status/{has_guarantee}", response_model=List[UserGuaranteeResponse])
async def get_guarantees_by_status(
    has_guarantee: bool,
    db: AsyncSession = Depends(get_bot_db_session),
):
    """Get all users with specific guarantee status."""
    
    query = select(UserGuarantee).where(UserGuarantee.has_guarantee == has_guarantee)
    result = await db.execute(query)
    guarantees = result.scalars().all()
    
    return [UserGuaranteeResponse.model_validate(g) for g in guarantees]


# ========== REMINDERS DATA ==========

@router.get("/reminders/types", response_model=List[ReminderTypeResponse])
async def get_reminder_types(
    active_only: bool = Query(True),
    db: AsyncSession = Depends(get_bot_db_session),
):
    """Get all reminder types."""
    
    query = select(ReminderType)
    
    if active_only:
        query = query.where(ReminderType.is_active == True)
    
    result = await db.execute(query)
    types = result.scalars().all()
    
    return [ReminderTypeResponse.model_validate(t) for t in types]


@router.get("/reminders/messages/{reminder_type_id}", response_model=List[ReminderMessageResponse])
async def get_reminder_messages(
    reminder_type_id: int,
    db: AsyncSession = Depends(get_bot_db_session),
):
    """Get all messages for a specific reminder type."""
    
    query = select(ReminderMessagePool).where(
        ReminderMessagePool.reminder_type_id == reminder_type_id
    )
    result = await db.execute(query)
    messages = result.scalars().all()
    
    return [ReminderMessageResponse.model_validate(m) for m in messages]


# ========== ANALYTICS ==========

@router.get("/analytics/daily-completion")
async def get_daily_completion_rate(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_bot_db_session),
):
    """Get daily homework completion rate for the last N days."""
    
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    
    query = select(
        UserHomework.date,
        func.count(UserHomework.id).label('total'),
        func.sum(cast(UserHomework.is_complete, Integer)).label('completed')
    ).where(
        and_(
            UserHomework.date >= start_date,
            UserHomework.date <= end_date
        )
    ).group_by(UserHomework.date).order_by(UserHomework.date)
    
    result = await db.execute(query)
    daily_stats = result.all()
    
    return [
        {
            "date": str(row.date),
            "total_submissions": row.total,
            "completed_submissions": row.completed or 0,
            "completion_rate": (row.completed / row.total * 100) if row.total > 0 else 0
        }
        for row in daily_stats
    ]


@router.get("/analytics/user-activity/{user_id}")
async def get_user_activity(
    user_id: str,
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_bot_db_session),
):
    """Get user activity for the last N days."""
    
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    
    # Get homework data
    hw_query = select(UserHomework).where(
        and_(
            UserHomework.user_id == user_id,
            UserHomework.date >= start_date,
            UserHomework.date <= end_date
        )
    ).order_by(UserHomework.date)
    
    hw_result = await db.execute(hw_query)
    homework = hw_result.scalars().all()
    
    # Get streak data
    streak_query = select(UserStreak).where(UserStreak.user_id == user_id)
    streak_result = await db.execute(streak_query)
    streak = streak_result.scalar_one_or_none()
    
    return {
        "user_id": user_id,
        "period": {
            "start": str(start_date),
            "end": str(end_date),
            "days": days
        },
        "homework": [
            {
                "date": str(hw.date),
                "anki": hw.anki_submitted,
                "test": hw.test_submitted,
                "lesson": hw.lesson_submitted,
                "complete": hw.is_complete
            }
            for hw in homework
        ],
        "streak": {
            "current": streak.current_streak if streak else 0,
            "longest": streak.longest_streak if streak else 0,
            "last_completed": str(streak.last_completed_date) if streak and streak.last_completed_date else None
        },
        "statistics": {
            "total_days": len(homework),
            "completed_days": sum(1 for hw in homework if hw.is_complete),
            "anki_count": sum(1 for hw in homework if hw.anki_submitted),
            "test_count": sum(1 for hw in homework if hw.test_submitted),
            "lesson_count": sum(1 for hw in homework if hw.lesson_submitted)
        }
    }