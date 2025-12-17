"""API endpoints for question option management with media support."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from core.src.app.db.database import get_async_session
from core.src.app.schemas.course import (
    QuestionOptionCreate,
    QuestionOptionUpdate,
    QuestionOptionResponse,
    QuestionOptionWithMedia,
)
from core.src.app.repositories.course import QuestionOptionRepository
from core.src.app.services.media_s3_service import media_s3_service
from core.src.app.models.course_media import CourseMedia
from core.src.app.schemas.media_schema import CourseMediaResponse
import io

router = APIRouter()

@router.post("/", response_model=QuestionOptionResponse, status_code=status.HTTP_201_CREATED)
async def create_option(
    option_data: QuestionOptionCreate,
    session: AsyncSession = Depends(get_async_session)
):
    """Create a new question option."""
    repository = QuestionOptionRepository(session)
    option = await repository.create(**option_data.model_dump())
    return option


@router.get("/question/{question_id}", response_model=List[QuestionOptionResponse])
async def get_options_by_question(
    question_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get all options for a specific question."""
    repository = QuestionOptionRepository(session)
    options = await repository.get_by_question(question_id)
    return options


# НОВОЕ: Получить опции с медиа
@router.get("/question/{question_id}/with-media", response_model=List[QuestionOptionWithMedia])
async def get_options_by_question_with_media(
    question_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get all options for a question with media files."""
    repository = QuestionOptionRepository(session)
    options = await repository.get_by_question_with_media(question_id)
    
    # Добавляем presigned URLs для медиа
    response_options = []
    for option in options:
        response_data = QuestionOptionWithMedia.model_validate(option)
        for media in response_data.description_media:
            media.download_url = media_s3_service.generate_presigned_url(media.s3_key)
        response_options.append(response_data)
    
    return response_options


@router.get("/{option_id}", response_model=QuestionOptionResponse)
async def get_option(
    option_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get a specific option by ID."""
    repository = QuestionOptionRepository(session)
    option = await repository.get(option_id)
    if not option:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Option with id {option_id} not found"
        )
    return option


# НОВОЕ: Получить опцию с медиа
@router.get("/{option_id}/with-media", response_model=QuestionOptionWithMedia)
async def get_option_with_media(
    option_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get option with media files."""
    repository = QuestionOptionRepository(session)
    option = await repository.get_with_media(option_id)
    
    if not option:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Option with id {option_id} not found"
        )
    
    response_data = QuestionOptionWithMedia.model_validate(option)
    
    # Добавляем download URLs для S3 файлов
    for media in response_data.description_media:
        media.download_url = media_s3_service.generate_presigned_url(media.s3_key)
    
    return response_data


@router.put("/{option_id}", response_model=QuestionOptionResponse)
async def update_option(
    option_id: int,
    option_data: QuestionOptionUpdate,
    session: AsyncSession = Depends(get_async_session)
):
    """Update a question option."""
    repository = QuestionOptionRepository(session)
    update_data = option_data.model_dump(exclude_unset=True)
    option = await repository.update(option_id, **update_data)
    if not option:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Option with id {option_id} not found"
        )
    return option


@router.delete("/{option_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_option(
    option_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Delete a question option."""
    repository = QuestionOptionRepository(session)
    deleted = await repository.delete(option_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Option with id {option_id} not found"
        )
    return None


# НОВОЕ: Загрузка изображения для описания опции
@router.post("/{option_id}/upload-description-image", response_model=CourseMediaResponse)
async def upload_option_description_image(
    option_id: int,
    file: UploadFile = File(...),
    custom_name: str = Form(None),
    session: AsyncSession = Depends(get_async_session)
):
    """Upload an image for option description."""
    # Проверяем существование опции
    repository = QuestionOptionRepository(session)
    option = await repository.get(option_id)
    if not option:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Option with id {option_id} not found"
        )
    
    # Получаем размер файла
    file.file.seek(0, io.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)
    
    # Валидация файла (только изображения)
    is_valid, error_msg = media_s3_service.validate_file(
        file_size, 
        file.content_type, 
        file.filename,
        'image'  # Только изображения для описаний
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    try:
        # Загружаем в S3
        s3_key, metadata = media_s3_service.upload_media(
            file_obj=file.file,
            filename=file.filename or "option_description_image",
            media_type='image',
            content_type=file.content_type
        )
        
        # Сохраняем в БД с привязкой к option
        db_media = CourseMedia(
            filename=file.filename or "option_description_image",
            original_filename=file.filename or "option_description_image",
            custom_name=custom_name,
            size=file_size,
            content_type=file.content_type or "image/jpeg",
            media_type='image',
            s3_key=s3_key,
            question_option_id=option_id,
            width=metadata.get('width'),
            height=metadata.get('height'),
        )
        
        session.add(db_media)
        await session.commit()
        await session.refresh(db_media)
        
        # Генерируем presigned URL
        download_url = media_s3_service.generate_presigned_url(s3_key)
        
        response = CourseMediaResponse.from_orm(db_media)
        response.download_url = download_url
        
        return response
        
    except Exception as e:
        # Откатываем S3 при ошибке БД
        try:
            media_s3_service.delete_media(s3_key)
        except:
            pass
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading image: {str(e)}"
        )


# НОВОЕ: Удаление изображения описания
@router.delete("/{option_id}/description-image/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_option_description_image(
    option_id: int,
    media_id: str,
    session: AsyncSession = Depends(get_async_session)
):
    """Delete an image from option description."""
    from sqlalchemy import select
    
    # Проверяем существование медиа и его привязку к опции
    result = await session.execute(
        select(CourseMedia).where(
            CourseMedia.id == media_id,
            CourseMedia.question_option_id == option_id
        )
    )
    media = result.scalar_one_or_none()
    
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found or doesn't belong to this option"
        )
    
    try:
        # Удаляем из S3
        media_s3_service.delete_media(media.s3_key)
        
        # Удаляем из БД
        await session.delete(media)
        await session.commit()
        
        return None
        
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting image: {str(e)}"
        )