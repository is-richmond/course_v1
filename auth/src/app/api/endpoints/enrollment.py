"""Enrollment API endpoints for course management."""

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from auth.src.app.api.deps import get_current_active_user
from auth.src.app.db.database import get_async_session
from auth.src.app.models.user import User
from auth.src.app.repositories import UserRepository
from auth.src.app.schemas.enrollment import (
    EnrollmentResponse,
    MyCoursesResponse,
)
from auth.src.app.api.deps import (
    get_db_session,
    get_current_user,
    get_current_active_user,
    get_current_superuser,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/courses/{course_id}",
    status_code=status.HTTP_201_CREATED,
    response_model=EnrollmentResponse,
    description="Enroll a user in a course (admin only)",
)
async def enroll_in_course(
    course_id: str,
    user_id: str = Query(..., description="ID of the user to enroll"),
    current_user: User = Depends(get_current_superuser),  # ← используем get_current_superuser
    session: AsyncSession = Depends(get_async_session),
) -> EnrollmentResponse:
    """
    Enroll a user in a course. Only accessible by superusers.
    
    Args:
        course_id: ID of the course to enroll in
        user_id: ID of the user to enroll
        current_user: Current authenticated superuser
        session: Database session
        
    Returns:
        EnrollmentResponse: Response with enrollment status and updated course list
        
    Raises:
        HTTPException: If user is already enrolled or user not found
    """
    # Получаем пользователя, которого нужно записать
    user_repo = UserRepository(session)
    target_user = await user_repo.get_by_id(user_id)
    
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )
    
    # Get current enrolled courses
    enrolled_courses = target_user.enrolled_courses
    
    # Check if already enrolled
    if course_id in enrolled_courses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User is already enrolled in course {course_id}"
        )
    
    # Add course to enrolled courses
    updated_courses = enrolled_courses + [course_id]
    target_user.enrolled_courses = updated_courses
    
    # Save to database
    await user_repo.update(target_user.id, _enrolled_courses=target_user._enrolled_courses)
    await session.commit()
    
    logger.info(f"Admin {current_user.email} enrolled user {target_user.email} in course {course_id}")
    
    return EnrollmentResponse(
        message="Successfully enrolled",
        enrolled_courses=updated_courses
    )


@router.delete(
    "/courses/{course_id}",
    status_code=status.HTTP_200_OK,
    response_model=EnrollmentResponse,
    description="Unenroll a user from a course (admin only)",
)
async def unenroll_from_course(
    course_id: str,
    user_id: str = Query(..., description="ID of the user to unenroll"),
    current_user: User = Depends(get_current_superuser),  # ← используем get_current_superuser
    session: AsyncSession = Depends(get_async_session),
) -> EnrollmentResponse:
    """
    Unenroll a user from a course. Only accessible by superusers.
    
    Args:
        course_id: ID of the course to unenroll from
        user_id: ID of the user to unenroll
        current_user: Current authenticated superuser
        session: Database session
        
    Returns:
        EnrollmentResponse: Response with unenrollment status and updated course list
        
    Raises:
        HTTPException: If user is not enrolled or user not found
    """
    # Получаем пользователя
    user_repo = UserRepository(session)
    target_user = await user_repo.get_by_id(user_id)
    
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )
    
    enrolled_courses = target_user.enrolled_courses
    
    if course_id not in enrolled_courses:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User is not enrolled in course {course_id}"
        )
    
    updated_courses = [c for c in enrolled_courses if c != course_id]
    target_user.enrolled_courses = updated_courses
    
    await user_repo.update(target_user.id, _enrolled_courses=target_user._enrolled_courses)
    await session.commit()
    
    logger.info(f"Admin {current_user.email} unenrolled user {target_user.email} from course {course_id}")
    
    return EnrollmentResponse(
        message="Successfully unenrolled",
        enrolled_courses=updated_courses
    )


@router.get(
    "/my-courses",
    status_code=status.HTTP_200_OK,
    response_model=MyCoursesResponse,
    description="Get list of courses the current user is enrolled in",
)
async def get_my_courses(
    current_user: User = Depends(get_current_active_user),
) -> MyCoursesResponse:
    """
    Get the list of course IDs that the current user is enrolled in.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        MyCoursesResponse: Response with list of enrolled course IDs
    """
    logger.info(f"User {current_user.email} retrieved enrolled courses")
    
    return MyCoursesResponse(
        enrolled_courses=current_user.enrolled_courses
    )


@router.get(
    "/my-courses/details",
    status_code=status.HTTP_200_OK,
    response_model=MyCoursesResponse,
    description="Get detailed information about courses the current user is enrolled in",
)
async def get_my_courses_details(
    current_user: User = Depends(get_current_active_user),
) -> MyCoursesResponse:
    """
    Get detailed information about courses the current user is enrolled in.
    
    Note: This endpoint currently returns only course IDs. 
    To get full course details, use the course endpoints from the core service
    with the returned course IDs.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        MyCoursesResponse: Response with list of enrolled course IDs
    """
    logger.info(f"User {current_user.email} retrieved enrolled courses with details")
    
    return MyCoursesResponse(
        enrolled_courses=current_user.enrolled_courses
    )
