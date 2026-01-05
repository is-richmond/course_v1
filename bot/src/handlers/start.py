"""Start command handler"""

from aiogram import Router, F, types
from aiogram.filters import Command, StateFilter
from aiogram.types import Message, KeyboardButton, ReplyKeyboardMarkup
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from src.services.api_service import APIService
from src.services.session_service import session_service
from src.utils.logger import get_logger
import re

logger = get_logger(__name__)

router = Router()

api_service = APIService()

# Определяем состояния для FSM
class UserStates(StatesGroup):
    waiting_for_phone = State()

@router.message(Command("start"))
async def cmd_start(message: Message, state: FSMContext):
    """Handle /start command - ask for phone number"""
    telegram_id = message.from_user.id
    username = message.from_user.username or "unknown"
    
    logger.info(f"🤖 User started bot: {telegram_id} (@{username})")
    
    # Создаем клавиатуру с кнопкой "Отправить номер"
    keyboard = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📱 Отправить номер телефона", request_contact=True)]
        ],
        resize_keyboard=True,
        one_time_keyboard=True
    )
    
    await message.answer(
        "👋 Добро пожаловать!\n\n"
        "📱 Пожалуйста, отправьте ваш номер телефона для проверки в системе.\n\n"
        "Нажмите кнопку ниже или отправьте номер вручную в формате:  +7 (123) 456-78-90",
        reply_markup=keyboard
    )
    
    # Переходим в состояние ожидания номера
    await state.set_state(UserStates.waiting_for_phone)


@router.message(UserStates.waiting_for_phone, F.contact)
async def handle_contact(message: Message, state: FSMContext):
    """Handle phone number from contact button"""
    phone_number = message.contact.phone_number
    first_name = message.contact.first_name
    
    logger.info(f"📱 User sent phone:  {phone_number}")
    
    # Нормализуем номер телефона
    normalized_phone = normalize_phone(phone_number)
    
    # Проверяем юзера по номеру телефона
    user = await api_service.check_user_by_phone(normalized_phone)
    
    if user:
        # Юзер найден!    
        await message.answer(
            f"✅ Найдена учетная запись!\n\n"
            f"👤 Пользователь: {user.first_name} {user.last_name or ''}\n"
            f"📧 Email: {user.email}\n"
            f"📱 Телефон: {user.phone}\n\n"
            f"📸 Теперь вы можете загружать фотографии.\n"
            f"Просто отправьте мне фото! ",
            reply_markup=types.ReplyKeyboardRemove()
        )
        
        # ← РЕГИСТРИРУЕМ ПОЛЬЗОВАТЕЛЯ В СЕССИИ
        session_service. register_user(user.id, message.chat.id)
        
        # Очищаем state и сохраняем данные пользователя
        await state.clear()
        await state.update_data(
            user_id=user.id,
            phone=normalized_phone,
            telegram_id=message.from_user.id
        )
        
        logger. info(f"✅ User authenticated: {user.id}")
    else:
        # Юзер не найден
        await message.answer(
            "❌ К сожалению, пользователь с таким номером не найден в системе.\n\n"
            "🔗 Пожалуйста, зарегистрируйтесь на сайте:\n"
            "https://plexus.kz/register\n\n"
            "Или попробуйте еще раз с другим номером.",
            reply_markup=types.  ReplyKeyboardRemove()
        )
        
        # Возвращаемся к запросу номера
        await state.set_state(UserStates.waiting_for_phone)


@router.message(UserStates.  waiting_for_phone, F.  text)
async def handle_text_phone(message: Message, state: FSMContext):
    """Handle phone number as text - ТОЛЬКО если это НЕ команда"""
    phone_text = message.text
    
    logger.info(f"📱 User sent:  {phone_text}")
    
    # Пропускаем команды
    if phone_text. startswith('/'):
        logger.warning(f"User sent command while waiting for phone: {phone_text}")
        await message.answer(
            "❌ Пожалуйста, сначала введите номер телефона.\n\n"
            "Нажмите кнопку ниже или отправьте номер вручную в формате: +7 (123) 456-78-90"
        )
        return
    
    # Нормализуем номер телефона
    normalized_phone = normalize_phone(phone_text)
    
    if not normalized_phone:
        await message.answer(
            "❌ Пожалуйста, отправьте правильный номер телефона в формате:\n"
            "+7 (123) 456-78-90 или +7123456789010"
        )
        return
    
    # Проверяем юзера по номеру телефона
    user = await api_service.check_user_by_phone(normalized_phone)
    
    if user:
        await message.answer(
            f"✅ Найдена учетная запись!\n\n"
            f"👤 Пользователь: {user.first_name} {user.  last_name or ''}\n"
            f"📧 Email: {user.email}\n"
            f"📱 Телефон: {user.phone}\n\n"
            f"📸 Теперь вы можете загружать фотографии.\n"
            f"Просто отправьте мне фото!",
            reply_markup=types.ReplyKeyboardRemove()
        )
        
        # ← РЕГИСТРИРУЕМ ПОЛЬЗОВАТЕЛЯ В СЕССИИ
        session_service.register_user(user.id, message.chat.id)
        
        # Очищаем state и сохраняем данные пользователя
        await state.  clear()
        await state.update_data(
            user_id=user.id,
            phone=normalized_phone,
            telegram_id=message.from_user.id
        )
        
        logger.info(f"✅ User authenticated: {user.  id}")
    else:
        await message.answer(
            "❌ К сожалению, пользователь с таким номером не найден.\n\n"
            "🔗 Пожалуйста, зарегистрируйтесь на сайте:\n"
            "https://plexus.kz/register"
        )


@router.message(StateFilter(None), Command("help"))
async def cmd_help(message: Message):
    """Handle /help command"""
    help_text = (
        "📖 <b>Справка по использованию бота</b>\n\n"
        "/start - Начать работу с ботом\n"
        "/help - Эта справка\n"
        "/photos - Мои фото\n"
        "/profile - Мой профиль\n\n"
        "📸 <b>Как загружать фото:  </b>\n"
        "1. Используйте /start и отправьте номер телефона\n"
        "2. После проверки отправьте фото\n"
        "3. Фото будет загружено в облако"
    )
    await message.answer(help_text, parse_mode="HTML")


def normalize_phone(phone: str) -> str:
    """Normalize phone number to standard format"""
    
    # Удаляем все символы кроме цифр и +
    cleaned = re.sub(r'[^\d+]', '', phone)
    
    # Если номер начинается с 7, добавляем +
    if cleaned.startswith('7') and not cleaned.startswith('+'):
        cleaned = '+' + cleaned
    
    # Если номер начинается с 8, заменяем на +7
    if cleaned.startswith('8'):
        cleaned = '+7' + cleaned[1:]
    
    # Если нет +, добавляем
    if not cleaned.startswith('+'):
        cleaned = '+' + cleaned
    
    # Проверяем формат (11-15 цифр после +)
    if not re.match(r'^\+\d{10,15}$', cleaned):
        return None
    
    return cleaned