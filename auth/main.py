"""Main FastAPI application with authentication."""

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI

from auth.config import settings
from auth.database import create_db_and_tables
from auth.models import User
from auth.schemas import UserCreate, UserRead, UserUpdate
from auth.users import auth_backend, current_active_user, fastapi_users


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    await create_db_and_tables()
    yield
    # Shutdown


app = FastAPI(
    title=settings.APP_NAME,
    description="FastAPI Users Authentication Application with JWT",
    version="1.0.0",
    lifespan=lifespan
)

# Include FastAPI Users routers
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "FastAPI Users Authentication API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "register": "POST /auth/register",
            "login": "POST /auth/jwt/login",
            "logout": "POST /auth/jwt/logout",
            "current_user": "GET /users/me",
            "user_by_id": "GET /users/{id}",
            "update_user": "PATCH /users/{id}",
            "delete_user": "DELETE /users/{id}",
            "verify_request": "POST /auth/request-verify-token",
            "verify": "POST /auth/verify",
            "forgot_password": "POST /auth/forgot-password",
            "reset_password": "POST /auth/reset-password",
        }
    }


@app.get("/protected")
async def protected_route(user: User = Depends(current_active_user)):
    """Protected endpoint that requires authentication."""
    return {
        "message": f"Hello, {user.email}!",
        "user_id": str(user.id),
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "is_superuser": user.is_superuser,
    }
