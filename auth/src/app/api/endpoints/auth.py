"""Authentication API endpoints."""

import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from auth.src.app.api. deps import (
    get_db_session,
    get_current_user,
    get_current_active_user,
    get_current_superuser,
)
from auth.src.app. core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
    get_password_hash,
    verify_refresh_token,
)
from auth.src.app.db.database import get_async_session
from auth.src.app.exceptions import (
    InvalidCredentialsError,
    UserNotFoundError,
    UserInactiveError,
)
from auth.src. app.models.user import User
from auth.src.app.repositories import UserRepository, SessionRepository
from auth.src.app.schemas import (
    UserCreate,
    UserRead,
    UserUpdate,
    TokenOut,
    LoginRequest,
    RefreshTokenRequest,
    PasswordChangeRequest,
    PasswordResetRequest,
    GrantAdminRequest,
)


logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/register",
    status_code=status. HTTP_201_CREATED,
    response_model=TokenOut,
    description="Register a new user",
    response_model_exclude_none=True,
)
async def register(
    user_in: UserCreate,
    session: AsyncSession = Depends(get_async_session),
) -> TokenOut:
    """
    Register a new user and return access/refresh tokens.
    
    Args:
        user_in: User registration data
        session: Database session
        
    Returns:
        TokenOut: Access and refresh tokens
        
    Raises:
        HTTPException: If user already exists or validation fails
    """
    user_repo = UserRepository(session)
    
    # Check if user already exists
    existing_user = await user_repo.get_by_email(email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status. HTTP_409_CONFLICT,
            detail="User with this email already exists"
        )
    
    # Create new user with default values
    hashed_password = get_password_hash(user_in.password)
    user_data = {
        "email": user_in.email,
        "hashed_password": hashed_password,
        "is_active": True,
        "is_superuser": False,
        "is_verified": False,
    }
    
    new_user = await user_repo. create(**user_data)
    logger.info(f"New user registered: {new_user.email} (ID: {new_user.id})")
    
    # Create tokens
    access_token = create_access_token(subject=str(new_user.id))
    refresh_token = create_refresh_token(subject=str(new_user.id))
    
    return TokenOut(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
    response_model=TokenOut,
    description="Login with email and password",
    response_model_exclude_none=True,
)
async def login(
    login_data: LoginRequest,
    session: AsyncSession = Depends(get_async_session),
) -> TokenOut:
    """
    Authenticate user and return access/refresh tokens.
    
    Args:
        login_data: Login credentials
        session: Database session
        
    Returns:
        TokenOut: Access and refresh tokens
        
    Raises:
        HTTPException: If credentials are invalid or user is inactive
    """
    user_repo = UserRepository(session)
    
    # Get user by email
    user = await user_repo.get_by_email(email=login_data.email)
    if not user:
        logger.warning(f"Login attempt with non-existent email: {login_data.email}")
        raise InvalidCredentialsError()
    
    # Verify password
    if not verify_password(login_data.password, user.hashed_password):
        logger. warning(f"Failed login attempt for user: {user.email}")
        raise InvalidCredentialsError()
    
    # Check if user is active
    if not user. is_active:
        logger. warning(f"Inactive user login attempt: {user.email}")
        raise UserInactiveError()
    
    # Create tokens
    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    
    logger.info(f"User logged in successfully: {user.email}")
    
    return TokenOut(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post(
    "/refresh",
    status_code=status.HTTP_200_OK,
    response_model=TokenOut,
    description="Refresh access token using refresh token",
    response_model_exclude_none=True,
)
async def refresh_token(
    token_data: RefreshTokenRequest,
    session: AsyncSession = Depends(get_async_session),
) -> TokenOut:
    """
    Generate new access token using refresh token. 
    
    Args:
        token_data: Refresh token
        session: Database session
        
    Returns:
        TokenOut: New access and refresh tokens
        
    Raises:
        HTTPException: If refresh token is invalid
    """
    try:
        payload = verify_refresh_token(token_data.refresh_token)
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Verify user still exists and is active
        user_repo = UserRepository(session)
        user = await user_repo. get(UUID(user_id))
        
        if not user or not user. is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Create new tokens
        access_token = create_access_token(subject=user_id)
        refresh_token = create_refresh_token(subject=user_id)
        
        return TokenOut(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
        
    except Exception as e:
        logger.error(f"Token refresh failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


# @router. post(
#     "/logout",
#     status_code=status.HTTP_200_OK,
#     description="Logout current user",
# )
# async def logout(
#     current_user: User = Depends(get_current_active_user),
#     session: AsyncSession = Depends(get_async_session),
# ):
#     """
#     Logout current user and invalidate session. 
    
#     Args:
#         current_user: Current authenticated user
#         session: Database session
        
#     Returns:
#         Success message
#     """
#     logger.info(f"User logged out: {current_user.email}")
    
#     # Here you can add logic to blacklist tokens or delete sessions
#     # For now, we just return success
    
#     return {"message": "Successfully logged out"}


@router.post(
    "/forgot-password",
    status_code=status.HTTP_200_OK,
    description="Request password reset",
)
async def forgot_password(
    reset_data: PasswordResetRequest,
    session: AsyncSession = Depends(get_async_session),
):
    """
    Send password reset email to user.
    
    Args:
        reset_data: Email for password reset
        session: Database session
        
    Returns:
        Success message
    """
    user_repo = UserRepository(session)
    
    user = await user_repo.get_by_email(email=reset_data. email)
    
    if user:
        # Generate password reset token
        reset_token = create_access_token(
            subject=str(user.id),
            expires_delta=3600  # 1 hour
        )
        
        # TODO: Send email with reset link
        logger. info(f"Password reset requested for: {user.email}")
        logger.info(f"Reset token: {reset_token}")
    
    # Always return success to prevent email enumeration
    return {"message": "If the email exists, a reset link has been sent"}


@router.post(
    "/reset-password",
    status_code=status. HTTP_200_OK,
    description="Reset password with token",
)
async def reset_password(
    token: str,
    new_password: str,
    session: AsyncSession = Depends(get_async_session),
):
    """
    Reset user password using reset token.
    
    Args:
        token: Password reset token
        new_password: New password
        session: Database session
        
    Returns:
        Success message
    """
    try:
        payload = verify_refresh_token(token)
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status. HTTP_400_BAD_REQUEST,
                detail="Invalid reset token"
            )
        
        user_repo = UserRepository(session)
        user = await user_repo. get(UUID(user_id))
        
        if not user:
            raise UserNotFoundError()
        
        # Update password
        hashed_password = get_password_hash(new_password)
        await user_repo.update(user.id, hashed_password=hashed_password)
        
        logger.info(f"Password reset successful for user: {user.email}")
        
        return {"message": "Password reset successful"}
        
    except Exception as e:
        logger.error(f"Password reset failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )


@router.post(
    "/change-password",
    status_code=status.HTTP_200_OK,
    description="Change password for authenticated user",
)
async def change_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Change password for currently authenticated user.
    
    Args:
        password_data: Old and new passwords
        current_user: Current authenticated user
        session: Database session
        
    Returns:
        Success message
    """
    # Verify old password
    if not verify_password(password_data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password"
        )
    
    # Update to new password
    user_repo = UserRepository(session)
    hashed_password = get_password_hash(password_data.new_password)
    await user_repo.update(current_user.id, hashed_password=hashed_password)
    
    logger.info(f"Password changed for user: {current_user.email}")
    
    return {"message": "Password changed successfully"}


@router.post(
    "/admin",
    status_code=status.HTTP_200_OK,
    response_model=UserRead,
    description="Grant admin role to a user (superuser only)",
)
async def grant_admin_role(
    grant_data: GrantAdminRequest,
    current_user: User = Depends(get_current_superuser),
    session: AsyncSession = Depends(get_async_session),
) -> UserRead:
    """
    Grant administrator role to a user.
    Only superusers can grant admin roles.
    
    Args:
        grant_data: User ID to grant admin role
        current_user: Current authenticated superuser
        session: Database session
        
    Returns:
        UserRead: Updated user data
        
    Raises:
        HTTPException: If user not found or requester is not superuser
    """
    user_repo = UserRepository(session)
    
    # Get target user
    target_user = await user_repo.get(grant_data.user_id)
    
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is already a superuser
    if target_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already an administrator"
        )
    
    # Grant admin role
    updated_user = await user_repo. update(
        target_user.id,
        is_superuser=True
    )
    
    logger. info(
        f"Admin role granted to user {target_user.email} (ID: {target_user.id}) "
        f"by {current_user.email} (ID: {current_user.id})"
    )
    
    return UserRead. model_validate(updated_user)


# # Include FastAPI Users routers
# router. include_router(
#     fastapi_users.get_auth_router(auth_backend),
#     prefix="/jwt",
# )

# router.include_router(
#     fastapi_users.get_register_router(UserRead, UserCreate),
# )

# router.include_router(
#     fastapi_users.get_verify_router(UserRead),
# )

# router.include_router(
#     fastapi_users.get_reset_password_router(),
# )