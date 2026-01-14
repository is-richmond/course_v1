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
        "👋 <b>Привет! Я Лео — твой учебный ассистент.</b>\n\n"

        "Я здесь, чтобы «потом» не стало стилем жизни.\n"
        "И слежу, чтобы ты реально учился 👀\n\n"
        "Что я делаю:\n"
        "✅ Помогаю держать ритм\n"
        "⏰ Напоминаю, когда фокус начинает ускользать\n"
        "🔥 Считаю серию выполненных дней\n"
        "🛡 Слежу за гарантией (да, строго)\n\n"
        "Выбирай, с чего начнём 👇"
    )
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="❓ Как это работает", callback_data="faq_how_to")],
        [InlineKeyboardButton(text="🛡 Гарантия", callback_data="faq_guarantee")],
        [InlineKeyboardButton(text="📚 Anki для чайников", callback_data="faq_anki")],
        [InlineKeyboardButton(text="📤 Загрузить ДЗ", callback_data="upload_homework")],
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
        "📖 <b> Как это работает</b>\n\n"
        "<b> 1️⃣ Загрузка ДЗ 📤</b>\n"
        "Каждый учебный день = 3 вещи:\n"
        "• 🧠 Anki — чтобы не забывать\n"
        "• 📝 Тест — чтобы понимать\n"
        "• 🎓 Урок — чтобы было что учить\n"
        "3 скриншота → день засчитан ✔️\n\n"
        "2️⃣ <b>Напоминания</b>\n\n"
        "Иногда день летит.\n"
        "Иногда — расползается.\n"
        "Я появляюсь по ходу дня 👀\n"
        "🕚 11:00 — лёгкое напоминание\n"
        "🕗 20:00 — вечерний чекпоинт\n"
        "🕛 00:00 — фиксирую итог дня\n\n"
        "3️⃣ <b>Серия 🔥</b>\n"
        "Делаешь регулярно — серия растёт.\n"
        "Она нужна, чтобы видеть, чувствовать и не терять свой прогресс.\n\n"
        "4️⃣ <b>Гарантия 🛡</b>\n"
        "Её статус ты всегда можешь проверить в соответствующей вкладке! Придерживайся наших простых правил и можешь за неё не переживать!\n\n"
        "<b>В двух словах:</b>\n"
        "Ты живёшь жизнь.\n"
        "Я держу учёбу в форме 😎"
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
        "✅ <b>Гарантия — это про регулярность, а не про контроль.</b>\n\n"
        "<b>Чтобы она сохранялась:</b>\n"
        "1. Каждый день закрыты все 3 типа заданий\n"
        "2. Скриншоты загружены до 00:00\n"
        "3. Без пропусков дней\n\n"
        "⚠️ <b>Гарантия обновляется если:</b>\n"
        "• Пропущен день\n"
        "• Загружены не все задания\n"
        "• Нарушены правила курса\n\n"
        "Я и команда Plexus следим за этим 👀\n"
        "Статус всегда можно проверить в меню."
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
        "📚 <b>Anki для чайников</b>\n\n"
        "Anki — это приложение, с которым можно забыть о забывании.\n\n"
        "Эта система специально разработана под интервальное повторение — то есть ты повторяешь материал ровно в тот момент, когда мозг начинает его забывать. Алгоритм подкреплен десятками исследований в области нейронауки и памяти, именно поэтому Anki реально работает.\n\n"
        "🎯 <b>Зачем вообще Anki?</b>\n\n"
        "• Чтобы не перечитывать одно и то же\n"
        "• Чтобы помнить через недели и месяцы\n"
        "• Чтобы учёба была спокойнее и системнее\n\n"
        "<b>Как начать уже сегодня ⏱</b>\n\n"
        "1️⃣ <b>Скачай Anki</b>\n\n"
        "📱 Компьютер / телефон — тут:\n"
        "👉 https://apps.ankiweb.net/ \n\n"
        "2️⃣ <b>Добавь карточки</b>\n\n"
        "Есть два варианта — выбирай, как удобнее:\n\n"
        "🧩 <b>Вариант А: наши колоды (самый простой)</b>\n"
        "Колоды уже:\n"
        "— структурированы (и сохраняется гарантия)\n"
        "— разбиты по темам\n"
        "— подстроены под интервальное повторение\n\n"
        "<b>✍️ Вариант Б: свои карточки</b>\n"
        "— вопрос с одной стороны\n"
        "— ответ с другой\n"
        "— коротко и по делу\n\n"
        "<b>Как пользоваться каждый день </b>🔁 \n"
        "— открываешь Anki\n"
        "— повторяешь то, что необходимо\n"
        "— не решаешь, что учить — алгоритм все рассчитал\n\n"
        "<b>Что загружать в бота </b>📸\n"
        "Скрин экрана, где видно:\n"
        "- Количество повторённых карточек за день"


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


@router.callback_query(F.data == "my_progress")
async def show_my_progress(callback: types.CallbackQuery, state: FSMContext):
    """Show user progress"""
    data = await state.get_data()
    user_id = data.get("user_id")
    
    if not user_id:
        await callback.answer("❌ Авторизуйтесь:  /start", show_alert=True)
        return
    
    text = (
        "📊 <b>Мой прогресс</b>\n\n"
        "Ваша статистика здесь"
    )
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🛡 Проверить гарантию", callback_data="check_guarantee")],
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