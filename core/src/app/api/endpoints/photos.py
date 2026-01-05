"""Photo upload endpoints for Telegram bot"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Union
import io
import logging

from core.src.app.api.deps import get_db_session as get_db
from core.src.app.models.course_media import CourseMedia
from core.src.app.schemas.media_schema import (
    CourseMediaResponse,
    MediaListResponse,
    MediaUploadResponse,
)
from core.src.app. services.media_s3_service import media_s3_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/upload", response_model=MediaUploadResponse)
async def upload_user_photo(
    file: UploadFile = File(... ),
    user_id: Union[int, str] = Form(... ),  # ← ИЗМЕНИ: принимаем int ИЛИ str (UUID)
    db: AsyncSession = Depends(get_db),
):
    """Загрузить фото от пользователя (для Telegram бота)"""
    try:
        # Конвертируем user_id если строка
        if isinstance(user_id, str):
            try:
                user_id = int(user_id)
            except ValueError:
                # Если не число - берем хеш от UUID для использования как integer
                user_id = abs(hash(user_id)) % (2**31)
        
        # Получаем размер файла
        file. file.seek(0, io. SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0)
        
        # Валидация файла (только изображения)
        is_valid, error_msg = media_s3_service. validate_file(
            file_size, 
            file.content_type, 
            file.filename,
            media_type='image'
        )
        
        if not is_valid: 
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        logger.info(f"Uploading photo from user {user_id}:  {file.filename}, size: {file_size} bytes")
        
        # Загружаем в S3
        try:
            s3_key, metadata = media_s3_service.upload_media(
                file_obj=file.file,
                filename=file.filename or f"user_{user_id}_photo",
                media_type='image',
                content_type=file.content_type,
                user_id=user_id
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
                filename=file.filename or f"user_{user_id}_photo",
                original_filename=file.filename or f"user_{user_id}_photo",
                custom_name=f"User {user_id} Photo",
                size=file_size,
                content_type=file.content_type or "image/jpeg",
                media_type='image',
                s3_key=s3_key,
                user_id=user_id,
                width=metadata.get('width'),
                height=metadata.get('height'),
            )
            
            db.add(db_media)
            await db.commit()
            await db.refresh(db_media)
            
            logger.info(f"Photo uploaded successfully:  {db_media.id} for user {user_id}")
            
            # Генерируем presigned URL
            download_url = media_s3_service.generate_presigned_url(s3_key)
            
            response = CourseMediaResponse. from_orm(db_media)
            response.download_url = download_url
            
            return MediaUploadResponse(
                media=response,
                message=f"Фото успешно загружено"
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

@router.get("/user/{user_id}", response_model=MediaListResponse)
async def get_user_photos(
    user_id: Union[int, str],  # ← ИЗМЕНИ: принимаем int ИЛИ str
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    """Получить все фото пользователя"""
    try:
        # Конвертируем user_id если строка
        if isinstance(user_id, str):
            try:
                user_id = int(user_id)
            except ValueError:
                user_id = abs(hash(user_id)) % (2**31)
        
        # Получаем фото пользователя
        query = select(CourseMedia).where(
            CourseMedia.user_id == user_id,
            CourseMedia.media_type == 'image'
        ).order_by(CourseMedia.created_at.desc())
        
        result = await db.execute(query. offset(skip).limit(limit))
        media_list = result.scalars().all()
        
        # Считаем общее количество
        count_query = select(func.count()).select_from(CourseMedia).where(
            CourseMedia. user_id == user_id,
            CourseMedia.media_type == 'image'
        )
        total = await db.execute(count_query)
        total_count = total.scalar_one()
        
        # Добавляем presigned URLs
        media_responses = []
        for media in media_list:  
            response = CourseMediaResponse.from_orm(media)
            response. download_url = media_s3_service.generate_presigned_url(media.s3_key)
            media_responses.append(response)
        
        logger.info(f"Retrieved {len(media_responses)} photos for user {user_id}")
        
        return MediaListResponse(
            media=media_responses,
            total=total_count
        )
        
    except Exception as e:
        logger.error(f"Error fetching user photos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка получения фото: {str(e)}"
        )

@router.delete("/{photo_id}")
async def delete_user_photo(
    photo_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Удалить фото пользователя"""
    try:
        result = await db.execute(
            select(CourseMedia).where(CourseMedia.id == photo_id)
        )
        media = result.scalar_one_or_none()
        
        if not media:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Фото не найдено"
            )
        
        user_id = media.user_id
        
        # Удаляем из S3
        media_s3_service.delete_media(media.s3_key)
        
        # Удаляем из БД
        await db.delete(media)
        await db.commit()
        
        logger.info(f"Photo {photo_id} deleted for user {user_id}")
        
        return {"message": "Фото успешно удалено"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting photo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка удаления фото: {str(e)}"
        )