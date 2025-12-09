"""Enrollment schemas for course registration."""

from typing import List, Optional
from pydantic import BaseModel, Field


class EnrollmentResponse(BaseModel):
    """Response schema for enrollment operations."""
    
    message: str = Field(..., description="Operation result message")
    enrolled_courses: List[str] = Field(default_factory=list, description="List of enrolled course IDs")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Successfully enrolled",
                "enrolled_courses": ["1", "2", "3"]
            }
        }


class CourseEnrollmentStatus(BaseModel):
    """Schema for course enrollment status."""
    
    course_id: str = Field(..., description="Course ID")
    is_enrolled: bool = Field(..., description="Whether user is enrolled in the course")
    
    class Config:
        json_schema_extra = {
            "example": {
                "course_id": "1",
                "is_enrolled": True
            }
        }


class MyCoursesResponse(BaseModel):
    """Response schema for user's enrolled courses."""
    
    enrolled_courses: List[str] = Field(default_factory=list, description="List of enrolled course IDs")
    
    class Config:
        json_schema_extra = {
            "example": {
                "enrolled_courses": ["1", "2", "3"]
            }
        }
