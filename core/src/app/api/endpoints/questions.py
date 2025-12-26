"""API endpoints for test question management with media support."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
import io

from core.src.app.db.database import get_async_session
from core.src.app.schemas.course import (
    TestQuestionCreate,
    TestQuestionUpdate,
    TestQuestionResponse,
    TestQuestionWithMedia,
    QuestionWithOptions,
)
from core.src.app.repositories.course import TestQuestionRepository
from core.src.app.services.media_s3_service import media_s3_service
from core.src.app.models.course_media import CourseMedia
from core.src.app.schemas.media_schema import CourseMediaResponse

router = APIRouter()

@router.post("/", response_model=TestQuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    question_data: TestQuestionCreate,
    session: AsyncSession = Depends(get_async_session)
):
    """Create a new test question."""
    repository = TestQuestionRepository(session)
    question = await repository.create(**question_data.model_dump())
    return question


@router.get("/test/{test_id}", response_model=List[TestQuestionResponse])
async def get_questions_by_test(
    test_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get all questions for a specific test."""
    repository = TestQuestionRepository(session)
    questions = await repository.get_by_test(test_id)
    return questions


# НОВОЕ: Получить вопросы теста с медиа
@router.get("/test/{test_id}/with-media", response_model=List[TestQuestionWithMedia])
async def get_questions_by_test_with_media(
    test_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get all questions for a test with media files."""
    repository = TestQuestionRepository(session)
    questions = await repository.get_by_test_with_media(test_id)
    
    # Добавляем presigned URLs для медиа
    response_questions = []
    for question in questions:
        response_data = TestQuestionWithMedia.model_validate(question)
        for media in response_data.description_media:
            media.download_url = media_s3_service.generate_presigned_url(media.s3_key)
        response_questions.append(response_data)
    
    return response_questions


@router.get("/{question_id}", response_model=TestQuestionResponse)
async def get_question(
    question_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get a specific question by ID."""
    repository = TestQuestionRepository(session)
    question = await repository.get(question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with id {question_id} not found"
        )
    return question


# НОВОЕ: Получить вопрос с медиа
@router.get("/{question_id}/with-media", response_model=TestQuestionWithMedia)
async def get_question_with_media(
    question_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get question with media files."""
    repository = TestQuestionRepository(session)
    question = await repository.get_with_media(question_id)
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with id {question_id} not found"
        )
    
    response_data = TestQuestionWithMedia.model_validate(question)
    
    # Добавляем download URLs для S3 файлов
    for media in response_data.description_media:
        media.download_url = media_s3_service.generate_presigned_url(media.s3_key)
    
    return response_data


@router.get("/{question_id}/with-options", response_model=QuestionWithOptions)
async def get_question_with_options(
    question_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get a question with its options loaded."""
    repository = TestQuestionRepository(session)
    question = await repository.get_with_options(question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with id {question_id} not found"
        )
    return question


@router.put("/{question_id}", response_model=TestQuestionResponse)
async def update_question(
    question_id: int,
    question_data: TestQuestionUpdate,
    session: AsyncSession = Depends(get_async_session)
):
    """Update a test question."""
    repository = TestQuestionRepository(session)
    update_data = question_data.model_dump(exclude_unset=True)
    question = await repository.update(question_id, **update_data)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with id {question_id} not found"
        )
    return question


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Delete a test question."""
    repository = TestQuestionRepository(session)
    deleted = await repository.delete(question_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with id {question_id} not found"
        )
    return None


# НОВОЕ: Загрузка изображения для описания вопроса
@router.post("/{question_id}/upload-description-image", response_model=CourseMediaResponse)
async def upload_question_description_image(
    question_id: int,
    file: UploadFile = File(...),
    custom_name: str = Form(None),
    session: AsyncSession = Depends(get_async_session)
):
    """Upload an image for question description."""
    # Проверяем существование вопроса
    repository = TestQuestionRepository(session)
    question = await repository.get(question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with id {question_id} not found"
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
            filename=file.filename or "question_description_image",
            media_type='image',
            content_type=file.content_type
        )
        
        # Сохраняем в БД с привязкой к вопросу
        db_media = CourseMedia(
            filename=file.filename or "question_description_image",
            original_filename=file.filename or "question_description_image",
            custom_name=custom_name,
            size=file_size,
            content_type=file.content_type or "image/jpeg",
            media_type='image',
            s3_key=s3_key,
            test_question_id=question_id,
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


# НОВОЕ: Удаление изображения описания вопроса
@router.delete("/{question_id}/description-image/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question_description_image(
    question_id: int,
    media_id: str,
    session: AsyncSession = Depends(get_async_session)
):
    """Delete an image from question description."""
    from sqlalchemy import select
    
    # Проверяем существование медиа и его привязку к вопросу
    result = await session.execute(
        select(CourseMedia).where(
            CourseMedia.id == media_id,
            CourseMedia.test_question_id == question_id
        )
    )
    media = result.scalar_one_or_none()
    
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found or doesn't belong to this question"
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