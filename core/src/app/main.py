"""Main FastAPI application for core service."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from pydantic_core import ValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.gzip import GZipMiddleware

from core.src.app.api import api_router
from core.src.app.core.config import settings
from core.src.app.db.database import create_db_and_tables
from core.src.app.exceptions import (
    validation_error_handler,
    integrity_error_handler,
    sqlalchemy_error_handler,
    general_exception_handler,
    add_process_time_header,
    log_requests,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

# Reduce verbosity for third-party libraries
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
logging.getLogger('sqlalchemy.pool').setLevel(logging.WARNING)
logging.getLogger('sqlalchemy.orm').setLevel(logging.WARNING)
logging.getLogger('sqlalchemy.dialects').setLevel(logging.WARNING)
logging.getLogger('passlib').setLevel(logging.ERROR)
logging.getLogger('uvicorn.access').setLevel(logging.WARNING)

logger = logging.getLogger(__name__)


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Core API",
    version="1.0.0",
    debug=settings.DEBUG,
    openapi_url="/core/openapi.json",
    docs_url="/core/docs",
    redoc_url="/core/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Middlewares
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
        "docs": "/core/docs",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": "1.0.0"
    }