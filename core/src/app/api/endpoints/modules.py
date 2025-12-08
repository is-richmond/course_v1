"""API endpoints for course module management."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.src.app.db.database import get_async_session
from core.src.app.schemas.course import (
    CourseModuleCreate,
    CourseModuleUpdate,
    CourseModuleResponse,
    ModuleWithLessons,
)
from core.src.app.repositories.course import CourseModuleRepository

router = APIRouter(prefix="/modules", tags=["modules"])


@router.post("/", response_model=CourseModuleResponse, status_code=status.HTTP_201_CREATED)
async def create_module(
    module_data: CourseModuleCreate,
    session: AsyncSession = Depends(get_async_session)
):
    """Create a new course module."""
    repository = CourseModuleRepository(session)
    module = await repository.create(**module_data.model_dump())
    return module


@router.get("/course/{course_id}", response_model=List[CourseModuleResponse])
async def get_modules_by_course(
    course_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get all modules for a specific course."""
    repository = CourseModuleRepository(session)
    modules = await repository.get_by_course(course_id)
    return modules


@router.get("/{module_id}", response_model=CourseModuleResponse)
async def get_module(
    module_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get a specific module by ID."""
    repository = CourseModuleRepository(session)
    module = await repository.get(module_id)
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module with id {module_id} not found"
        )
    return module


@router.get("/{module_id}/with-lessons", response_model=ModuleWithLessons)
async def get_module_with_lessons(
    module_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get a module with its lessons loaded."""
    repository = CourseModuleRepository(session)
    module = await repository.get_with_lessons(module_id)
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module with id {module_id} not found"
        )
    return module


@router.put("/{module_id}", response_model=CourseModuleResponse)
async def update_module(
    module_id: int,
    module_data: CourseModuleUpdate,
    session: AsyncSession = Depends(get_async_session)
):
    """Update a course module."""
    repository = CourseModuleRepository(session)
    update_data = module_data.model_dump(exclude_unset=True)
    module = await repository.update(module_id, **update_data)
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module with id {module_id} not found"
        )
    return module


@router.delete("/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_module(
    module_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Delete a course module."""
    repository = CourseModuleRepository(session)
    deleted = await repository.delete(module_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module with id {module_id} not found"
        )
    return None
