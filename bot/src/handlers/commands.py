"""Command handlers"""

from aiogram import Router, types
from aiogram.filters import Command, StateFilter
from aiogram.fsm.context import FSMContext
from src.services.api_service import APIService
from src.utils.logger import get_logger

logger = get_logger(__name__)
router = Router()

api_service = APIService()

@router.message(StateFilter(None), Command("photos"))
async def cmd_photos(message: types.Message, state: FSMContext):
    """Get all user photos"""
    data = await state.get_data()
    user_id = data.get("user_id")
    
    if not user_id:
        await message.answer("❌ Сначала используйте /start")
        return
    
    status_msg = await message.answer("⏳ Загружаю ваши фото...")
    
    try:
        photos = await api_service.get_user_photos(user_id)
        
        if not photos:
            await status_msg.edit_text("📷 У вас нет загруженных фото")
            return
        
        await status_msg.delete()
        
        # ← ОТПРАВЛЯЕМ КАЖДОЕ ФОТО С ССЫЛКОЙ
        for i, photo in enumerate(photos, 1):
            caption = (
                f"📸 Фото #{i}\n\n"
                f"📐 Размер: {photo.width}x{photo.height}\n"
                f"📁 Файл: {photo.original_filename}\n"
                f"⏰ Время:  {photo.created_at.strftime('%d.%m.%Y %H:%M')}\n"
                f"🔗 <a href='{photo.download_url}'>Скачать</a>"
            )
            
            try:
                # Отправляем фото с ссылкой
                await message.answer_photo(
                    photo=photo. download_url,
                    caption=caption,
                    parse_mode="HTML"
                )
            except Exception as e:
                logger.warning(f"Failed to send photo as image: {e}")
                # Fallback: отправляем просто ссылку
                await message. answer(
                    f"📸 Фото #{i}\n\n"
                    f"📐 Размер: {photo.width}x{photo.height}\n"
                    f"📁 Файл: {photo.original_filename}\n"
                    f"⏰ Время:  {photo.created_at.strftime('%d.%m.%Y %H:%M')}\n"
                    f"🔗 <a href='{photo.download_url}'>Скачать фото</a>",
                    parse_mode="HTML"
                )
        
        await message.answer(
            f"✅ Показано {len(photos)} фото из вашей коллекции"
        )
        logger.info(f"✅ Showed {len(photos)} photos for user {user_id}")
        
    except Exception as e:  
        logger.error(f"Error getting photos: {e}", exc_info=True)
        try:
            await status_msg.edit_text("❌ Ошибка при загрузке списка фото")
        except:
            await message.answer("❌ Ошибка при загрузке списка фото")


@router.message(StateFilter(None), Command("profile"))
async def cmd_profile(message: types.Message, state: FSMContext):
    """Show user profile"""
    data = await state.get_data()
    user_id = data.get("user_id")
    phone = data.get("phone")
    
    if not user_id:  
        await message.answer("❌ Сначала используйте /start")
        return
    
    profile_text = (
        "👤 Ваш профиль:\n\n"
        f"🆔 ID: {user_id}\n"
        f"📱 Телефон: {phone}\n\n"
        "Используйте /photos для просмотра ваших фото"
    )
    
    await message.answer(profile_text)
    logger.info(f"✅ Showed profile for user {user_id}")


@router.message(StateFilter(None), Command("help"))
async def cmd_help(message: types.Message):
    """Show help"""
    help_text = (
        "📖 <b>Справка по использованию бота</b>\n\n"
        "/start - Начать работу с ботом\n"
        "/help - Эта справка\n"
        "/photos - Мои фото\n"
        "/profile - Мой профиль\n\n"
        "📸 <b>Как загружать фото: </b>\n"
        "1. Используйте /start и отправьте номер телефона\n"
        "2. После проверки отправьте фото\n"
        "3. Фото будет загружено в облако\n\n"
        "💡 Используйте /photos для просмотра всех загруженных фото"
    )
    await message.answer(help_text, parse_mode="HTML")