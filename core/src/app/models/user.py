"""User models for the authentication system."""

from datetime import datetime
from typing import Optional

from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from auth.src.app.db.database import Base


class User(SQLAlchemyBaseUserTableUUID, Base):
    """User model with UUID primary key."""
    
    __tablename__ = "user"
    
    # Additional fields
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        onupdate=func.now(),
        nullable=True
    )
