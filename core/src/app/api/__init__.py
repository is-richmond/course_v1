"""API router initialization."""

from fastapi import APIRouter

from src.app.api.endpoints import (
    courses,
    modules,
    lessons,
    media,
    tests,
    questions,
    options,
    progress,
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(courses.router)
api_router.include_router(modules.router)
api_router.include_router(lessons.router)
api_router.include_router(media.router)
api_router.include_router(tests.router)
api_router.include_router(questions.router)
api_router.include_router(options.router)
api_router.include_router(progress.router)