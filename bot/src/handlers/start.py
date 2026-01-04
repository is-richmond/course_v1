"""Start command handler"""

from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, FSInputFile
from aiogram.fsm.context import FSMContext
from src. services.api_service import APIService
from src.services.user_service import UserService
from src.utils.logger import get_logger

logger = get_logger(__name__)

router = Router()

api_service = APIService()
user_service = UserService(api_service)

@router.message(Command("start"))
async def cmd_start(message: Message, state: FSMContext):
    """Handle /start command"""
    telegram_id = message.from_user.id
    username = message.from_user.username or "unknown"
    first_name = message.from_user.first_name or "User"
    
    logger.info(f"🤖 User started bot:  {telegram_id} (@{username})")
    
    # Get or create user
    result = await user_service.get_or_create_user(
        telegram_id=telegram_id,
        username=username,
        first_name=first_name
    )
    
    user_id = result. get("user_id")
    
    if not user_id:
        await message.answer(
            "❌ К сожалению, не удалось проверить вашу учетную запись.\n"
            "Пожалуйста, убедитесь, что вы зарегистрированы в системе Plexus.\n\n"
            "👉 <a href='https://plexus.kz'>Перейти на сайт</a>"
        )
        return
    
    # User exists or was created
    is_new = not result.get("exists", False)
    
    if is_new:
        await message.answer(
            f"🎉 Добро пожаловать, {first_name}!\n\n"
            "Вы успешно зарегистрировались в нашей системе.\n\n"
            "📸 Теперь вы можете загружать фотографии.\n"
            "Просто отправьте мне фото, и оно будет сохранено."
        )
    else:
        await message.answer(
            f"👋 Добро пожаловать снова, {first_name}!\n\n"
            "📸 Отправьте мне фото для загрузки."
        )
    
    # Store user_id in state
    await state.update_data(user_id=user_id, telegram_id=telegram_id)


@router.message(Command("help"))
async def cmd_help(message: Message):
    """Handle /help command"""
    help_text = (
        "📖 <b>Справка по использованию бота</b>\n\n"
        "/start - Начать работу с ботом\n"
        "/profile - Мой профиль\n"
        "/photos - Мои фотографии\n"
        "/help - Эта справка\n\n"
        "📸 <b>Как загружать фото: </b>\n"
        "1. Используйте /start для инициализации\n"
        "2. Отправьте фото боту\n"
        "3. Фото будет загружено в облако"
    )
    await message.answer(help_text)


@router.message(Command("profile"))
async def cmd_profile(message: Message, state: FSMContext):
    """Handle /profile command"""
    data = await state.get_data()
    user_id = data. get("user_id")
    
    if not user_id: 
        await message.answer("❌ Сначала используйте /start")
        return
    
    user = await api_service.check_user_by_telegram_id(message.from_user.id)
    
    if user:
        profile_text = (
            f"👤 <b>Ваш профиль</b>\n\n"
            f"ID: {user.id}\n"
            f"Имя: {user.first_name}\n"
            f"Email: {user.email}\n"
            f"Статус: {'✅ Верифицирован' if user.is_verified else '⏳ На проверке'}\n"
            f"Дата регистрации: {user.created_at. strftime('%d.%m.%Y')}"
        )
        await message.answer(profile_text)
    else:
        await message. answer("❌ Профиль не найден")


@router.message(Command("photos"))
async def cmd_photos(message: Message, state: FSMContext):
    """Handle /photos command"""
    data = await state. get_data()
    user_id = data.get("user_id")
    
    if not user_id:
        await message.answer("❌ Сначала используйте /start")
        return
    
    photos = await api_service.get_user_photos(user_id)
    
    if not photos:
        await message.answer("📸 У вас нет загруженных фотографий")
        return
    
    text = f"📸 <b>Ваши фотографии ({len(photos)})</b>\n\n"
    for i, photo in enumerate(photos, 1):
        text += f"{i}. {photo.uploaded_at.strftime('%d.%m.%Y %H:%M')}\n"
    
    await message.answer(text)