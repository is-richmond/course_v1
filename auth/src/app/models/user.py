"""User models for the authentication system."""

import json
from datetime import datetime
from typing import Optional, List

from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from sqlalchemy import DateTime, func, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.mutable import MutableList

from auth.src.app.db.database import Base


class JSONEncodedList(MutableList):
    """Mutable list for JSON-encoded array in SQLite."""
    
    @classmethod
    def coerce(cls, key, value):
        """Convert value to mutable list."""
        if isinstance(value, cls):
            return value
        if isinstance(value, list):
            return cls(value)
        if isinstance(value, str):
            try:
                return cls(json.loads(value))
            except:
                return cls([])
        return cls([])


class User(SQLAlchemyBaseUserTableUUID, Base):
    """User model with UUID primary key."""
    
    __tablename__ = "user"
    
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
        except:
            return []
    
    @enrolled_courses.setter
    def enrolled_courses(self, value: Optional[List[str]]):
        """Set enrolled courses from list."""
        if value is None or value == []:
            self._enrolled_courses = None
        else:
            self._enrolled_courses = json.dumps(value)
