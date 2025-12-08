"""Token schemas."""

from pydantic import BaseModel, EmailStr, Field


class TokenOut(BaseModel):
    """Schema for token response."""
    
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    """Schema for login request."""
    
    email: EmailStr
    password: str = Field(..., min_length=1)


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""
    
    refresh_token: str


class PasswordChangeRequest(BaseModel):
    """Schema for password change request."""
    
    old_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=100)


class PasswordResetRequest(BaseModel):
    """Schema for password reset request."""
    
    email: EmailStr