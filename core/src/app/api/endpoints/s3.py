# app/api/routes/media.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Literal
import io
import logging

from core.src.app.api.deps import get_db_session as get_db
from core.src.app.models.course_media import CourseMedia
from core.src.app.schemas.media_schema import (
    CourseMediaResponse,
    MediaListResponse,
    MediaUploadResponse,
    CourseMediaUpdate,
    MediaConfigResponse
)
from core.src.app.services.media_s3_service import media_s3_service
from core.src.app.repositories.media_s3_config import media_s3_settings

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/upload", response_model=MediaUploadResponse)
async def upload_media(
    file: UploadFile = File(...),
    media_type: Literal['image', 'video'] = Form(...),
    course_id: Optional[int] = Form(None),
    lesson_id: Optional[int] = Form(None),
    custom_name: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
):
    """Загрузить медиа-файл (изображение или видео)"""
    try:
        # Получаем размер файла
        file.file.seek(0, io.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0)
        
        # Валидация файла
        is_valid, error_msg = media_s3_service.validate_file(
            file_size, 
            file.content_type, 
            file.filename,
            media_type
        )
        
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        logger.info(f"Uploading {media_type}: {file.filename}, size: {file_size} bytes")
        
        # Загружаем в S3
        try:
            s3_key, metadata = media_s3_service.upload_media(
                file_obj=file.file,
                filename=file.filename or f"unnamed_{media_type}",
                media_type=media_type,
                content_type=file.content_type,
                course_id=course_id,
                lesson_id=lesson_id
            )
        except Exception as e:
            logger.error(f"S3 upload error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка загрузки в S3: {str(e)}"
            )
        
        # Сохраняем в БД
        try:
            db_media = CourseMedia(
                filename=file.filename or f"unnamed_{media_type}",
                original_filename=file.filename or f"unnamed_{media_type}",
                custom_name=custom_name,
                size=file_size,
                content_type=file.content_type or "application/octet-stream",
                media_type=media_type,
                s3_key=s3_key,
                course_id=course_id,
                lesson_id=lesson_id,
                width=metadata.get('width'),
                height=metadata.get('height'),
                duration=metadata.get('duration'),
            )
            
            db.add(db_media)
            await db.commit()
            await db.refresh(db_media)
            
            logger.info(f"Media uploaded successfully: {db_media.id}")
            
            # Генерируем presigned URL
            download_url = media_s3_service.generate_presigned_url(s3_key)
            
            response = CourseMediaResponse.from_orm(db_media)
            response.download_url = download_url
            
            return MediaUploadResponse(
                media=response,
                message=f"{media_type.capitalize()} успешно загружен"
            )
            
        except Exception as e:
            # Откатываем S3 при ошибке БД
            try:
                media_s3_service.delete_media(s3_key)
            except:
                pass
            
            logger.error(f"Database error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка сохранения в БД: {str(e)}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Неожиданная ошибка: {str(e)}"
        )
    


@router.get("/media/{media_id}", response_model=CourseMediaResponse)
async def get_media_by_id(
    media_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Получить медиа-файл по ID"""
    try:
        result = await db.execute(
            select(CourseMedia).where(CourseMedia.id == media_id)
        )
        media = result.scalar_one_or_none()
        
        if not media:
            raise HTTPException(
                status_code=status. HTTP_404_NOT_FOUND,
                detail=f"Медиа с ID {media_id} не найдено"
            )
        
        # Генерируем presigned URL для скачивания
        download_url = media_s3_service.generate_presigned_url(media.s3_key)
        
        response = CourseMediaResponse.from_orm(media)
        response.download_url = download_url
        
        logger.info(f"Media retrieved successfully: {media_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger. error(f"Error fetching media by ID: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка получения медиа: {str(e)}"
        )

@router.get("/media", response_model=MediaListResponse)
async def get_all_media(
    skip: int = 0,
    limit: int = 100,
    media_type: Optional[Literal['image', 'video']] = None,
    course_id: Optional[int] = None,
    lesson_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    """Получить список медиа-файлов"""
    try:
        query = select(CourseMedia)
        
        if media_type:
            query = query.where(CourseMedia.media_type == media_type)
        if course_id:
            query = query.where(CourseMedia.course_id == course_id)
        if lesson_id:
            query = query.where(CourseMedia.lesson_id == lesson_id)
        
        result = await db.execute(query.offset(skip).limit(limit))
        media_list = result.scalars().all()
        
        count_query = select(func.count()).select_from(CourseMedia)
        if media_type:
            count_query = count_query.where(CourseMedia.media_type == media_type)
        if course_id:
            count_query = count_query.where(CourseMedia.course_id == course_id)
        if lesson_id:
            count_query = count_query.where(CourseMedia.lesson_id == lesson_id)
        
        total = await db.execute(count_query)
        total_count = total.scalar_one()
        
        # Добавляем presigned URLs
        media_responses = []
        for media in media_list:
            response = CourseMediaResponse.from_orm(media)
            response.download_url = media_s3_service.generate_presigned_url(media.s3_key)
            media_responses.append(response)
        
        return MediaListResponse(
            media=media_responses,
            total=total_count
        )
        
    except Exception as e:
        logger.error(f"Error fetching media: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка получения медиа: {str(e)}"
        )

@router.delete("/media/{media_id}")
async def delete_media(
    media_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Удалить медиа-файл"""
    try:
        result = await db.execute(select(CourseMedia).where(CourseMedia.id == media_id))
        media = result.scalar_one_or_none()
        
        if not media:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Медиа не найдено"
            )
        
        # Удаляем из S3
        media_s3_service.delete_media(media.s3_key)
        
        # Удаляем из БД
        await db.delete(media)
        await db.commit()
        
        return {"message": "Медиа успешно удалено"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting media: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка удаления медиа: {str(e)}"
        )

@router.get("/config", response_model=MediaConfigResponse)
async def get_media_config():
    """Получить конфигурацию медиа S3"""
    try:
        connection_status = media_s3_service.check_connection()
        
        return MediaConfigResponse(
            endpoint=media_s3_settings.S3_ENDPOINT,
            bucket=media_s3_settings.S3_MEDIA_BUCKET,
            region=media_s3_settings.S3_REGION,
            max_image_size=media_s3_settings.MAX_IMAGE_SIZE,
            max_video_size=media_s3_settings.MAX_VIDEO_SIZE,
            allowed_image_types=list(media_s3_settings.ALLOWED_IMAGE_TYPES),
            allowed_video_types=list(media_s3_settings.ALLOWED_VIDEO_TYPES),
            connection_status=connection_status
        )
        
    except Exception as e:
        logger.error(f"Error getting media config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка получения конфигурации: {str(e)}"
        )