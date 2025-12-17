# core/src/app/models/course_media.py - обновленная модель

from sqlalchemy import Column, String, Integer, DateTime, BigInteger, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.src.app.db.database import Base
import uuid

class CourseMedia(Base):
    __tablename__ = "course_media"
    __table_args__ = {'extend_existing': True}
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    custom_name = Column(String, nullable=True)
    size = Column(BigInteger, nullable=False)
    content_type = Column(String, nullable=False)
    media_type = Column(String, nullable=False)  # 'image' или 'video'
    s3_key = Column(String, nullable=False, unique=True)
    
    # Привязка к курсу/уроку
    course_id = Column(Integer, ForeignKey('courses.id'), nullable=True)
    lesson_id = Column(Integer, ForeignKey('lessons.id'), nullable=True)
    
    # НОВОЕ: Привязка к описанию ответа
    question_option_id = Column(Integer, ForeignKey('question_options.id'), nullable=True)
    
    # Метаданные
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    duration = Column(Integer, nullable=True)
    
    uploaded_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    course = relationship("Course", back_populates="course_media")
    lesson = relationship("Lesson", back_populates="lesson_media")
    
    # НОВОЕ: Связь с ответом на вопрос
    question_option = relationship("QuestionOption", back_populates="description_media")
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'custom_name': self.custom_name,
            'size': self.size,
            'content_type': self.content_type,
            'media_type': self.media_type,
            's3_key': self.s3_key,
            'course_id': self.course_id,
            'lesson_id': self.lesson_id,
            'question_option_id': self.question_option_id,
            'width': self.width,
            'height': self.height,
            'duration': self.duration,
            'uploaded_by': self.uploaded_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }