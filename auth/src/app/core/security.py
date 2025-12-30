"""Security utilities for authentication and authorization."""

import hashlib
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import bcrypt
import jwt

from auth.src.app.core.config import settings

logger = logging.getLogger(__name__)

# JWT settings
ALGORITHM = "HS256"


def create_access_token(
    subject: str,
    expires_delta: Optional[int] = None
) -> str:
    """
    Create JWT access token.
    
    Args:
        subject: Token subject (usually user ID)
        expires_delta: Token expiration time in seconds
        
    Returns:
        str: Encoded JWT token
    """
    if expires_delta:
        expire = datetime.utcnow() + timedelta(seconds=expires_delta)
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "access"
    }
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=ALGORITHM
    )
    
    return encoded_jwt


def create_refresh_token(
    subject: str,
    expires_delta: Optional[int] = None
) -> str:
    """
    Create JWT refresh token.
    
    Args:
        subject: Token subject (usually user ID)
        expires_delta: Token expiration time in seconds
        
    Returns:
        str: Encoded JWT token
    """
    if expires_delta:
        expire = datetime.utcnow() + timedelta(seconds=expires_delta)
    else:
        expire = datetime.utcnow() + timedelta(days=7)  # 7 days for refresh token
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh"
    }
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=ALGORITHM
    )
    
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode and verify JWT access token.
    
    Args:
        token: JWT token to decode
        
    Returns:
        Dict[str, Any]: Decoded token payload
        
    Raises:
        jwt.ExpiredSignatureError: If token has expired
        jwt.InvalidTokenError: If token is invalid
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        
        if payload.get("type") != "access":
            raise jwt.InvalidTokenError("Invalid token type")
        
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.warning("Access token has expired")
        raise
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid access token: {e}")
        raise


def verify_refresh_token(token: str) -> Dict[str, Any]:
    """
    Verify JWT refresh token.
    
    Args:
        token: JWT refresh token to verify
        
    Returns:
        Dict[str, Any]: Decoded token payload
        
    Raises:
        jwt.ExpiredSignatureError: If token has expired
        jwt.InvalidTokenError: If token is invalid
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        
        if payload.get("type") != "refresh":
            raise jwt.InvalidTokenError("Invalid token type")
        
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.warning("Refresh token has expired")
        raise
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid refresh token: {e}")
        raise


def _prepare_password(password: str) -> bytes:
    """
    Prepare password for bcrypt hashing.
    Bcrypt has a 72 byte limit, so we hash long passwords with SHA256 first.
    
    Args:
        password: Plain text password
        
    Returns:
        bytes: Prepared password bytes (original if <=72 bytes, SHA256 if longer)
    """
    password_bytes = password.encode('utf-8')
    
    # If password is longer than 72 bytes, hash it with SHA256 first
    if len(password_bytes) > 72:
        # Return SHA256 hash as bytes
        return hashlib.sha256(password_bytes).digest()
    
    return password_bytes


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a bcrypt hash.
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Bcrypt hash to verify against
        
    Returns:
        bool: True if password matches, False otherwise
    """
    try:
        prepared_password = _prepare_password(plain_password)
        return bcrypt.checkpw(prepared_password, hashed_password.encode('utf-8'))
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: Plain text password to hash
        
    Returns:
        str: Bcrypt hash of the password
    """
    try:
        prepared_password = _prepare_password(password)
        # Generate salt and hash password
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(prepared_password, salt)
        return hashed.decode('utf-8')
    except Exception as e:
        logger.error(f"Password hashing error: {e}")
        raise