"""Photo handler"""

from aiogram import Router, F
from aiogram.types import Message
from aiogram.fsm.context import FSMContext
import io
from src.services.api_service import APIService
from src. services.s3_service import S3Service
from src.utils.logger import get_logger

logger = get_logger(__name__)

router = Router()

api_service = APIService()
s3_service = S3Service()

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
        
        # Download photo
        photo_data = await message.bot.session.get(
            f"https://api.telegram.org/file/bot{message.bot.token}/{file.file_path}"
        )
        file_bytes = photo_data.content
        
        logger.info(f"📥 Photo downloaded: {len(file_bytes)} bytes")
        
        # Generate filename
        filename = f"photo_{photo.file_id}.jpg"
        
        # Upload to API (which will handle S3)
        photo_response = await api_service.upload_photo(
            user_id=user_id,
            file_data=file_bytes,
            filename=filename
        )
        
        if photo_response: 
            await status_message.delete()
            await message.answer(
                "✅ Фото успешно загружено!\n\n"
                f"📁 Файл: {photo_response.s3_key}\n"
                f"⏰ Время:  {photo_response.uploaded_at.strftime('%d. %m.%Y %H:%M')}\n\n"
                "📸 Вы можете загружать еще фото или используйте /photos для просмотра всех"
            )
            logger.info(f"✅ Photo uploaded: {user_id}")
        else:
            await status_message.edit_text(
                "❌ Ошибка загрузки фото. Попробуйте позже."
            )
            logger.error(f"Failed to upload photo for user {user_id}")
    
    except Exception as e: 
        logger.error(f"Photo handling error: {e}")
        await status_message.edit_text(
            f"❌ Ошибка:  {str(e)}\n\n"
            "Попробуйте еще раз или свяжитесь с поддержкой."
        )


@router.message(F. document)
async def handle_document(message: Message):
    """Handle other file types"""
    await message.answer(
        "❌ Пожалуйста, отправьте фото, а не документ.\n"
        "Используйте камеру для отправки изображений."
    )


@router.message(F.text)
async def handle_text(message: Message, state: FSMContext):
    """Handle unexpected text"""
    text = message.text. lower()
    
    if text in ["привет", "hello", "hi", "ё", "привет"]:
        await message.answer("👋 Привет! Отправьте мне фото для загрузки.")
    elif text in ["помощь", "help"]:
        await message.answer(
            "📖 Используйте /help для справки\n"
            "Отправьте фото для загрузки"
        )
    else:
        await message.answer(
            "👉 Пожалуйста, отправьте фото\n\n"
            "Или используйте команды:\n"
            "/start - Начать\n"
            "/help - Справка\n"
            "/profile - Мой профиль\n"
            "/photos - Мои фото"
        )