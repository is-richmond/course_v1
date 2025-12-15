"""User models for the authentication system."""
import json
from datetime import datetime
from typing import Optional, List
from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from sqlalchemy import DateTime, func, Text, String
from sqlalchemy.orm import Mapped, mapped_column
from auth.src.app.db.database import Base

class User(SQLAlchemyBaseUserTableUUID, Base):
    """User model with UUID primary key."""
    __tablename__ = "user"
    
    # New fields
    first_name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    last_name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    phone_number: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        unique=True
    )
    
    # Additional fields - stored as JSON text for SQLite compatibility
    _enrolled_courses: Mapped[Optional[str]] = mapped_column(
        "enrolled_courses",
        Text,
        nullable=True
    )
    
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
    
    @property
    def enrolled_courses(self) -> List[str]:
        """Get enrolled courses as list."""
        if not self._enrolled_courses:
            return []
        try:
            return json.loads(self._enrolled_courses)
        except json.JSONDecodeError:
            return []
    
    @enrolled_courses.setter
    def enrolled_courses(self, value: Optional[List[str]]):
        """Set enrolled courses from list."""
        if value is None or value == []:
            self._enrolled_courses = None
        else:
            self._enrolled_courses = json.dumps(value)