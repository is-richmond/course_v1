"""API endpoints for course management."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.db.database import get_async_session
from src.app.schemas.course import (
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    CourseWithModules,
)
from src.app.repositories.course import CourseRepository

router = APIRouter(prefix="/courses", tags=["courses"])


@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_data: CourseCreate,
    session: AsyncSession = Depends(get_async_session)
):
    """Create a new course."""
    repository = CourseRepository(session)
    course = await repository.create(**course_data.model_dump())
    return course


@router.get("/", response_model=List[CourseResponse])
async def list_courses(
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_async_session)
):
    """Get list of all courses."""
    repository = CourseRepository(session)
    courses = await repository.list(skip=skip, limit=limit)
    return courses


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get a specific course by ID."""
    repository = CourseRepository(session)
    course = await repository.get(course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with id {course_id} not found"
        )
    return course


@router.get("/{course_id}/with-modules", response_model=CourseWithModules)
async def get_course_with_modules(
    course_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get a course with its modules loaded."""
    repository = CourseRepository(session)
    course = await repository.get_with_modules(course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with id {course_id} not found"
        )
    return course


@router.get("/author/{author_id}", response_model=List[CourseResponse])
async def get_courses_by_author(
    author_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get all courses by a specific author."""
    repository = CourseRepository(session)
    courses = await repository.get_by_author(author_id)
    return courses


@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: int,
    course_data: CourseUpdate,
    session: AsyncSession = Depends(get_async_session)
):
    """Update a course."""
    repository = CourseRepository(session)
    # Only update fields that are provided
    update_data = course_data.model_dump(exclude_unset=True)
    course = await repository.update(course_id, **update_data)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with id {course_id} not found"
        )
    return course


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Delete a course."""
    repository = CourseRepository(session)
    deleted = await repository.delete(course_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with id {course_id} not found"
        )
    return None
