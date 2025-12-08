"""API router initialization."""

from fastapi import APIRouter

from auth.src.app.api.endpoints import auth, users

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router)
api_router.include_router(users.router)