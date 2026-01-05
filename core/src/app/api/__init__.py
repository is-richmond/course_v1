"""API router initialization."""

from fastapi import APIRouter

from core.src.app.api.endpoints import (
    courses,
    modules,
    lessons,
    media,
    tests,
    questions,
    options,
    s3,
    progress,
    combined,
    photos,
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(courses.router, prefix="/courses", tags=["Courses"])
api_router.include_router(modules.router, prefix="/modules", tags=["Modules"])
api_router.include_router(lessons.router, prefix="/lessons", tags=["Lessons"])
api_router.include_router(media.router, prefix="/media", tags=["Media"])
api_router.include_router(tests.router, prefix="/tests", tags=["Tests"])
api_router.include_router(questions.router, prefix="/questions", tags=["Questions"])
api_router.include_router(options.router, prefix="/options", tags=["Options"])
api_router.include_router(progress.router, prefix="/progress", tags=["Progress"])
api_router.include_router(s3.router, prefix="/s3", tags=["S3"])     
api_router.include_router(combined.router, prefix="/combined-tests", tags=["Combined Tests"])
api_router.include_router(photos.router, prefix="/photos", tags=["Photos"])