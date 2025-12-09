"""Enrollment API endpoints for course management."""

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from auth.src.app.api.deps import get_current_active_user
from auth.src.app.db.database import get_async_session
from auth.src.app.models.user import User
from auth.src.app.repositories import UserRepository
from auth.src.app.schemas.enrollment import (
    EnrollmentResponse,
    MyCoursesResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/enrollment", tags=["enrollment"])


@router.post(
    "/courses/{course_id}",
    status_code=status.HTTP_201_CREATED,
    response_model=EnrollmentResponse,
    description="Enroll current user in a course",
)
async def enroll_in_course(
    course_id: str,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> EnrollmentResponse:
    """
    Enroll the current authenticated user in a course.
    
    Args:
        course_id: ID of the course to enroll in
        current_user: Current authenticated user
        session: Database session
        
    Returns:
        EnrollmentResponse: Response with enrollment status and updated course list
        
    Raises:
        HTTPException: If user is already enrolled in the course
    """
    # Get current enrolled courses
    enrolled_courses = current_user.enrolled_courses
    
    # Check if already enrolled
    if course_id in enrolled_courses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User is already enrolled in course {course_id}"
        )
    
    # Add course to enrolled courses
    enrolled_courses.append(course_id)
    current_user.enrolled_courses = enrolled_courses
    
    # Save to database
    user_repo = UserRepository(session)
    await user_repo.update(current_user.id, _enrolled_courses=current_user._enrolled_courses)
    await session.commit()
    
    logger.info(f"User {current_user.email} enrolled in course {course_id}")
    
    return EnrollmentResponse(
        message="Successfully enrolled",
        enrolled_courses=enrolled_courses
    )


@router.delete(
    "/courses/{course_id}",
    status_code=status.HTTP_200_OK,
    response_model=EnrollmentResponse,
    description="Unenroll current user from a course",
)
async def unenroll_from_course(
    course_id: str,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> EnrollmentResponse:
    """
    Unenroll the current authenticated user from a course.
    
    Args:
        course_id: ID of the course to unenroll from
        current_user: Current authenticated user
        session: Database session
        
    Returns:
        EnrollmentResponse: Response with unenrollment status and updated course list
        
    Raises:
        HTTPException: If user is not enrolled in the course
    """
    # Get current enrolled courses
    enrolled_courses = current_user.enrolled_courses
    
    # Check if enrolled
    if course_id not in enrolled_courses:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User is not enrolled in course {course_id}"
        )
    
    # Remove course from enrolled courses
    enrolled_courses.remove(course_id)
    current_user.enrolled_courses = enrolled_courses
    
    # Save to database
    user_repo = UserRepository(session)
    await user_repo.update(current_user.id, _enrolled_courses=current_user._enrolled_courses)
    await session.commit()
    
    logger.info(f"User {current_user.email} unenrolled from course {course_id}")
    
    return EnrollmentResponse(
        message="Successfully unenrolled",
        enrolled_courses=enrolled_courses
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
