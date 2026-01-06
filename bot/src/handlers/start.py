"""Updated start command handler with welcome menu"""

from aiogram import Router, F, types
from aiogram.filters import Command, StateFilter
from aiogram.types import Message, KeyboardButton, ReplyKeyboardMarkup, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from src.services.api_service import APIService
from src.services.session_service import session_service
from src.services.reminder_type_service import reminder_type_service
from src.utils.logger import get_logger
import re

logger = get_logger(__name__)

router = Router()
api_service = APIService()

class UserStates(StatesGroup):
    waiting_for_phone = State()

@router.message(Command("start"))
async def cmd_start(message: Message, state: FSMContext):
    """Handle /start command"""
    # Check if user already authenticated
    data = await state.get_data()
    user_id = data.get("user_id")
    
    if user_id:
        # User already authenticated, show welcome menu
        await show_welcome_menu(message)
    else:
        # New user, ask for phone
        await ask_for_phone(message, state)

async def ask_for_phone(message: Message, state: FSMContext):
    """Ask user for phone number"""
    telegram_id = message.from_user.id
    username = message.from_user.username or "unknown"
    
    logger.info(f"🤖 User started bot: {telegram_id} (@{username})")
    
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
        "Нажмите кнопку ниже или отправьте номер вручную в формате: +7 (123) 456-78-90",
        reply_markup=keyboard
    )
    
    await state.set_state(UserStates.waiting_for_phone)

async def show_welcome_menu(message: Message):
    """Show welcome menu with buttons"""
    # Get welcome message from database
    welcome_msg = reminder_type_service.get_welcome_message("welcome")
    
    welcome_text = welcome_msg.message if welcome_msg else (
        "👋 <b>Привет! Я бот-помощник для курса!</b>\n\n"
        "Я помогу тебе:\n"
        "✅ Отслеживать выполнение домашних заданий\n"
        "✅ Напоминать о дедлайнах\n"
        "✅ Поддерживать твою серию выполнения\n"
        "✅ Следить за статусом гарантии\n\n"
        "Выбери интересующий раздел:"
    )
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="❓ Как пользоваться ботом", callback_data="faq_how_to")],
        [InlineKeyboardButton(text="🛡️ Как работает гарантия", callback_data="faq_guarantee")],
        [InlineKeyboardButton(text="📚 Туториал Anki", callback_data="faq_anki")],
        [InlineKeyboardButton(text="📸 Загрузить ДЗ", callback_data="upload_homework")],
        [InlineKeyboardButton(text="📊 Мой прогресс", callback_data="my_progress")]
    ])
    
    await message.answer(
        welcome_text,
        reply_markup=keyboard,
        parse_mode="HTML"
    )

@router.message(UserStates.waiting_for_phone, F.contact)
async def handle_contact(message: Message, state: FSMContext):
    """Handle phone number from contact button"""
    phone_number = message.contact.phone_number
    
    logger.info(f"📱 User sent phone: {phone_number}")
    
    normalized_phone = normalize_phone(phone_number)
    user = await api_service.check_user_by_phone(normalized_phone)
    
    if user:
        # User found - register and show welcome
        session_service.register_user(user.id, message.chat.id)
        
        await state.clear()
        await state.update_data(
            user_id=user.id,
            phone=normalized_phone,
            telegram_id=message.from_user.id
        )
        
        await message.answer(
            f"✅ <b>Аккаунт найден!</b>\n\n"
            f"👤 {user.first_name} {user.last_name or ''}\n"
            f"📧 {user.email}\n"
            f"📱 {user.phone}",
            reply_markup=types.ReplyKeyboardRemove(),
            parse_mode="HTML"
        )
        
        logger.info(f"✅ User authenticated: {user.id}")
        
        # Show welcome menu
        await show_welcome_menu(message)
    else:
        await message.answer(
            "❌ К сожалению, пользователь с таким номером не найден в системе.\n\n"
            "🔗 Пожалуйста, зарегистрируйтесь на сайте:\n"
            "https://plexus.kz/register\n\n"
            "Или попробуйте еще раз с другим номером.",
            reply_markup=types.ReplyKeyboardRemove()
        )
        
        await state.set_state(UserStates.waiting_for_phone)

@router.message(UserStates.waiting_for_phone, F.text)
async def handle_text_phone(message: Message, state: FSMContext):
    """Handle phone number as text"""
    phone_text = message.text
    
    if phone_text.startswith('/'):
        await message.answer(
            "❌ Пожалуйста, сначала введите номер телефона.\n\n"
            "Нажмите кнопку ниже или отправьте номер вручную."
        )
        return
    
    normalized_phone = normalize_phone(phone_text)
    
    if not normalized_phone:
        await message.answer(
            "❌ Неверный формат номера телефона.\n"
            "Используйте: +7 (123) 456-78-90"
        )
        return
    
    user = await api_service.check_user_by_phone(normalized_phone)
    
    if user:
        session_service.register_user(user.id, message.chat.id)
        
        await state.clear()
        await state.update_data(
            user_id=user.id,
            phone=normalized_phone,
            telegram_id=message.from_user.id
        )
        
        await message.answer(
            f"✅ <b>Аккаунт найден!</b>\n\n"
            f"👤 {user.first_name} {user.last_name or ''}\n"
            f"📧 {user.email}\n"
            f"📱 {user.phone}",
            reply_markup=types.ReplyKeyboardRemove(),
            parse_mode="HTML"
        )
        
        logger.info(f"✅ User authenticated: {user.id}")
        await show_welcome_menu(message)
    else:
        await message.answer(
            "❌ Пользователь не найден.\n\n"
            "🔗 Зарегистрируйтесь: https://plexus.kz/register"
        )

# ========== FAQ HANDLERS ==========

@router.callback_query(F.data == "faq_how_to")
async def show_faq_how_to(callback: types.CallbackQuery):
    """Show how to use bot FAQ"""
    faq = reminder_type_service.get_welcome_message("how_to_use")
    
    text = faq.message if faq else (
        "📖 <b>Как пользоваться ботом</b>\n\n"
        "1️⃣ <b>Загрузка ДЗ</b>\n"
        "Каждый день нужно загрузить 3 скриншота:\n"
        "• 📝 Anki карточки\n"
        "• 📋 Тест\n"
        "• 🎓 Урок\n\n"
        "2️⃣ <b>Напоминания</b>\n"
        "Бот будет напоминать:\n"
        "• 21:00 - ДЗ на завтра\n"
        "• 11:00 - первое напоминание\n"
        "• 20:00 - последнее напоминание\n"
        "• 00:00 - статус выполнения\n\n"
        "3️⃣ <b>Серия выполнения</b>\n"
        "За регулярное выполнение ДЗ вы получите поздравления!\n\n"
        "4️⃣ <b>Гарантия</b>\n"
        "Выполняйте все задания вовремя для сохранения гарантии"
    )
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="◀️ Назад", callback_data="back_to_menu")]
    ])
    
    await callback.message.edit_text(
        text,
        reply_markup=keyboard,
        parse_mode="HTML"
    )
    await callback.answer()

@router.callback_query(F.data == "faq_guarantee")
async def show_faq_guarantee(callback: types.CallbackQuery):
    """Show guarantee FAQ"""
    faq = reminder_type_service.get_welcome_message("guarantee")
    
    text = faq.message if faq else (
        "🛡️ <b>Как работает гарантия</b>\n\n"
        "✅ <b>Условия сохранения гарантии:</b>\n\n"
        "1. Выполнять ВСЕ 3 типа ДЗ каждый день\n"
        "2. Загружать ДЗ до 00:00\n"
        "3. Не пропускать ни одного дня\n\n"
        "⚠️ <b>Гарантия аннулируется если:</b>\n\n"
        "• Пропущен хотя бы один день\n"
        "• Загружено не все ДЗ\n"
        "• Нарушены правила курса\n\n"
        "💡 <b>Проверка гарантии:</b>\n"
        "Используйте кнопку в меню для проверки статуса"
    )
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="◀️ Назад", callback_data="back_to_menu")]
    ])
    
    await callback.message.edit_text(
        text,
        reply_markup=keyboard,
        parse_mode="HTML"
    )
    await callback.answer()

@router.callback_query(F.data == "faq_anki")
async def show_faq_anki(callback: types.CallbackQuery):
    """Show Anki tutorial"""
    faq = reminder_type_service.get_welcome_message("anki")
    
    text = faq.message if faq else (
        "📚 <b>Туториал Anki</b>\n\n"
        "Anki - это программа для запоминания информации через карточки.\n\n"
        "🎯 <b>Как использовать:</b>\n\n"
        "1. Скачайте Anki: https://apps.ankiweb.net/\n"
        "2. Создайте карточки с вопросами\n"
        "3. Повторяйте их каждый день\n"
        "4. Делайте скриншот статистики\n\n"
        "📸 <b>Что загружать:</b>\n"
        "Скриншот экрана с количеством повторенных карточек за день\n\n"
        "💡 <b>Совет:</b>\n"
        "Лучше делать карточки сразу после изучения темы!"
    )
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="◀️ Назад", callback_data="back_to_menu")]
    ])
    
    await callback.message.edit_text(
        text,
        reply_markup=keyboard,
        parse_mode="HTML"
    )
    await callback.answer()

@router.callback_query(F.data == "back_to_menu")
async def back_to_menu(callback: types.CallbackQuery):
    """Return to main menu"""
    await show_welcome_menu(callback.message)
    await callback.answer()

def normalize_phone(phone: str) -> str:
    """Normalize phone number"""
    cleaned = re.sub(r'[^\d+]', '', phone)
    
    if cleaned.startswith('7') and not cleaned.startswith('+'):
        cleaned = '+' + cleaned
    
    if cleaned.startswith('8'):
        cleaned = '+7' + cleaned[1:]
    
    if not cleaned.startswith('+'):
        cleaned = '+' + cleaned
    
    if not re.match(r'^\+\d{10,15}$', cleaned):
        return None
    
    return cleaned