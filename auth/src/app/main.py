"""Main FastAPI application with authentication."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi. exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from pydantic_core import ValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.gzip import GZipMiddleware
from starlette.responses import Response as StarletteResponse

from auth.src.app.api import api_router
from auth.src.app. core.config import settings
from auth.src.app. db.database import create_db_and_tables
from auth.src.app.exceptions import (
    validation_error_handler,
    integrity_error_handler,
    sqlalchemy_error_handler,
    general_exception_handler,
    add_process_time_header,
    log_requests,
)

# Configure logging
logging. basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

# Reduce verbosity for third-party libraries
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
logging.getLogger('sqlalchemy.pool').setLevel(logging.WARNING)
logging.getLogger('sqlalchemy. orm').setLevel(logging.WARNING)
logging.getLogger('sqlalchemy.dialects').setLevel(logging.WARNING)
logging.getLogger('passlib').setLevel(logging.ERROR)  # Hide bcrypt warnings
logging.getLogger('uvicorn.access').setLevel(logging.WARNING)

# Keep app logs at INFO level
logger = logging.getLogger(__name__)


# Create FastAPI application
app = FastAPI(
    title=settings. APP_NAME,
    description="FastAPI Users Authentication Application with JWT",
    version="1.0.0",
    debug=settings.DEBUG,
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc",
)

# Custom middleware to handle OPTIONS requests
class CORSOptionsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request:  Request, call_next):
        # Handle preflight OPTIONS requests
        if request.method == "OPTIONS":
            response = StarletteResponse()
            response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
            response.headers["Access-Control-Allow-Methods"] = "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT"
            response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Max-Age"] = "600"
            response.status_code = 200
            return response
        
        response = await call_next(request)
        return response

# Add Custom OPTIONS handling first
app.add_middleware(CORSOptionsMiddleware)

# CORS Middleware - more specific configuration
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

# Add origins from settings if available
if hasattr(settings, 'ALLOWED_ORIGINS') and settings.ALLOWED_ORIGINS:
    if isinstance(settings.ALLOWED_ORIGINS, list):
        allowed_origins.extend(settings.ALLOWED_ORIGINS)
    elif isinstance(settings.ALLOWED_ORIGINS, str):
        allowed_origins.extend([origin.strip() for origin in settings. ALLOWED_ORIGINS.split(",")])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=[
        "Accept",
        "Accept-Language", 
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-CSRF-Token",
    ],
    expose_headers=["*"],
)

# Other Custom Middlewares
app.add_middleware(BaseHTTPMiddleware, dispatch=add_process_time_header)
app.add_middleware(BaseHTTPMiddleware, dispatch=log_requests)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Exception Handlers
app.add_exception_handler(RequestValidationError, validation_error_handler)
app.add_exception_handler(ValidationError, validation_error_handler)
app.add_exception_handler(IntegrityError, integrity_error_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_error_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Include API Router
app.include_router(router=api_router, prefix=settings.API_PREFIX)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": "1.0.0",
        "docs": f"{settings.API_PREFIX}/docs",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings. APP_NAME,
        "version": "1.0.0"
    }


# Add explicit OPTIONS handlers for main auth endpoints
@app.options("/api/v1/auth/login")
@app.options("/api/v1/auth/register") 
@app.options("/api/v1/auth/refresh")
@app.options("/api/v1/users/me")
@app.options("/api/v1/users/all")
async def handle_options():
    """Handle OPTIONS requests for auth endpoints."""
    return {"status": "ok"}