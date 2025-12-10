"""API router initialization."""

from fastapi import APIRouter

from auth.src.app.api.endpoints import auth, users, enrollment

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/user", tags=["User"])
api_router.include_router(enrollment.router, prefix="/enrollment", tags=["Enrollment"])