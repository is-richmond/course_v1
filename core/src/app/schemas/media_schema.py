# schemas/api/media_schema.py
from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime
import uuid

class CourseMediaBase(BaseModel):
    filename: str
    original_filename: str
    custom_name: Optional[str] = None
    size: int
    content_type: str
    media_type: Literal['image', 'video']
    s3_key: str
    course_id: Optional[int] = None
    lesson_id: Optional[int] = None
    question_option_id: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    duration: Optional[int] = None
    uploaded_by: Optional[str] = None

class CourseMediaCreate(CourseMediaBase):
    pass

class CourseMediaUpdate(BaseModel):
    custom_name: Optional[str] = None

class CourseMediaResponse(CourseMediaBase):
    id: str
    created_at: datetime
    updated_at: datetime
    download_url: Optional[str] = None  # presigned URL

    class Config:
        from_attributes = True

class MediaUploadResponse(BaseModel):
    media: CourseMediaResponse
    message: str

class MediaListResponse(BaseModel):
    media: List[CourseMediaResponse]
    total: int

class MediaConfigResponse(BaseModel):
    endpoint: str
    bucket: str
    region: str
    max_image_size: int
    max_video_size: int
    allowed_image_types: List[str]
    allowed_video_types: List[str]
    connection_status: bool



