"""Exception handlers and middleware."""

import logging
import time
from typing import Callable

from fastapi import Request, Response, status, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic_core import ValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

logger = logging.getLogger(__name__)


# Custom Exception Classes
class UserNotFoundError(HTTPException):
    """Exception raised when user is not found."""
    
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )


class UserInactiveError(HTTPException):
    """Exception raised when user is inactive."""
    
    def __init__(self):
        super().__init__(
            status_code=status. HTTP_403_FORBIDDEN,
            detail="User is inactive"
        )


class InvalidCredentialsError(HTTPException):
    """Exception raised when credentials are invalid."""
    
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )


# Exception Handlers
async def validation_error_handler(
    request: Request,
    exc: RequestValidationError | ValidationError
) -> JSONResponse:
    """
    Handle validation errors.
    
    Args:
        request: HTTP request
        exc: Validation exception
        
    Returns:
        JSONResponse: Error response
    """
    logger.warning(f"Validation error at {request.url}: {exc}")
    
    errors = []
    if isinstance(exc, RequestValidationError):
        errors = exc.errors()
    elif isinstance(exc, ValidationError):
        errors = exc.errors()
    
    return JSONResponse(
        status_code=status. HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": [
                {
                    "loc": error. get("loc"),
                    "msg": error.get("msg"),
                    "type": error. get("type"),
                }
                for error in errors
            ],
        },
    )


async def integrity_error_handler(
    request: Request,
    exc: IntegrityError
) -> JSONResponse:
    """
    Handle database integrity errors.
    
    Args:
        request: HTTP request
        exc: Integrity error exception
        
    Returns:
        JSONResponse: Error response
    """
    logger.error(f"Database integrity error at {request.url}: {exc}")
    
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={
            "detail": "Database integrity error",
            "message": "The operation conflicts with existing data"
        },
    )


async def sqlalchemy_error_handler(
    request: Request,
    exc: SQLAlchemyError
) -> JSONResponse:
    """
    Handle SQLAlchemy errors. 
    
    Args:
        request: HTTP request
        exc: SQLAlchemy exception
        
    Returns:
        JSONResponse: Error response
    """
    logger. error(f"Database error at {request.url}: {exc}")
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Database error",
            "message": "An error occurred while accessing the database"
        },
    )


async def general_exception_handler(
    request: Request,
    exc: Exception
) -> JSONResponse:
    """
    Handle general exceptions.
    
    Args:
        request: HTTP request
        exc: General exception
        
    Returns:
        JSONResponse: Error response
    """
    logger.error(f"Unhandled exception at {request.url}: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "message": "An unexpected error occurred"
        },
    )


async def add_process_time_header(request: Request, call_next: Callable) -> Response:
    """
    Add processing time to response headers.
    
    Args:
        request: HTTP request
        call_next: Next middleware/handler
        
    Returns:
        Response: HTTP response with process time header
    """
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}"
    return response


async def log_requests(request: Request, call_next: Callable) -> Response:
    """
    Log all incoming requests. 
    
    Args:
        request: HTTP request
        call_next: Next middleware/handler
        
    Returns:
        Response: HTTP response
    """
    logger.info(
        f"{request.method} {request.url. path} "
        f"- Client: {request.client.host if request.client else 'unknown'}"
    )
    
    response = await call_next(request)
    
    logger. info(
        f"Status: {response.status_code} "
        f"- {request. method} {request.url.path}"
    )
    
    return response