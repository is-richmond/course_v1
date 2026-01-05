"""Photo handler"""

from aiogram import Router, F
from aiogram.types import Message
from aiogram.fsm.context import FSMContext
import io
import uuid
from src.services.api_service import APIService
from src.utils.logger import get_logger

logger = get_logger(__name__)

# ← ВАЖНО: Определяем router в начале! 
router = Router()

api_service = APIService()

# Маппинг MIME типов на расширения
MIME_TO_EXT = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
}

@router.message(F.photo)
async def handle_photo(message: Message, state: FSMContext):
    """Handle photo upload"""
    data = await state.get_data()
    user_id = data.get("user_id")
    
    if not user_id:
        await message.answer(
            "❌ Сначала используйте /start для инициализации"
        )
        return
    
    # Show loading state
    status_message = await message.answer("⏳ Обработка фото...")
    
    try:
        # Get photo file
        photo = message.photo[-1]
        file = await message.bot.get_file(photo.file_id)
        
        # Download photo using bot's download method
        file_bytes = io.BytesIO()
        await message.bot.download_file(file.file_path, file_bytes)
        file_bytes = file_bytes.getvalue()
        
        logger.info(f"📥 Photo downloaded: {len(file_bytes)} bytes")
        
        # Используем UUID для имени файла
        ext = 'jpg'  # Telegram photos всегда JPEG
        filename = f"photo_{uuid.uuid4()}.{ext}"
        
        logger.info(f"Uploading photo: {filename}")
        
        # Upload to API (which will handle S3)
        photo_response = await api_service.upload_photo(
            user_id=user_id,
            file_data=file_bytes,
            filename=filename
        )
        
        if photo_response:   
            try:
                await status_message.delete()
            except:
                pass  # Message might be deleted already
            
            await message.answer(
                "✅ Фото успешно загружено!\n\n"
                f"📁 Файл: {photo_response.s3_key}\n"
                f"📐 Размер: {photo_response.width}x{photo_response.height}\n"
                f"⏰ Время:  {photo_response.created_at. strftime('%d.%m.%Y %H:%M')}\n\n"
                "📸 Вы можете загружать еще фото или используйте /photos для просмотра всех"
            )
            logger.info(f"✅ Photo uploaded: {user_id}")
        else:
            try:
                await status_message. edit_text(
                    "❌ Ошибка загрузки фото. Попробуйте позже."
                )
            except:
                await message.answer(
                    "❌ Ошибка загрузки фото. Попробуйте позже."
                )
            logger.error(f"Failed to upload photo for user {user_id}")
    
    except Exception as e:  
        logger.error(f"Photo handling error: {e}", exc_info=True)
        try:
            await status_message. edit_text(
                "❌ Ошибка при загрузке фото.\n\n"
                "Попробуйте еще раз или свяжитесь с поддержкой."
            )
        except:
            try:
                await message.answer(
                    "❌ Ошибка при загрузке фото.\n\n"
                    "Попробуйте еще раз или свяжитесь с поддержкой."
                )
            except:
                logger.error(f"Failed to send error message: {e}")


@router.message(F. document)
async def handle_document(message: Message):
    """Handle other file types"""
    await message.answer(
        "❌ Пожалуйста, отправьте фото, а не документ.\n"
        "Используйте камеру для отправки изображений."
    )