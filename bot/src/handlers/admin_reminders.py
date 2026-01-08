"""Admin handlers for managing reminder types and message pools"""
import io
import uuid
from src.services.api_service import APIService
from aiogram import Router, F, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from src.services.reminder_type_service import reminder_type_service
from src.services.service_streak import streak_service
from src.utils.logger import get_logger

logger = get_logger(__name__)
router = Router()
api_service = APIService()

# Admin IDs
ADMIN_IDS = [894877615]  # Add your admin IDs here

def is_admin(user_id: int) -> bool:
    """Check if user is admin"""
    return user_id in ADMIN_IDS

class ReminderTypeState(StatesGroup):
    waiting_for_name = State()
    waiting_for_time = State()
    waiting_for_days = State()

class MessagePoolState(StatesGroup):
    waiting_for_type_selection = State()
    waiting_for_message = State()
    waiting_for_image = State()

class StreakMessageState(StatesGroup):
    waiting_for_days = State()
    waiting_for_message = State()

# ========== MAIN ADMIN MENU ==========

@router.message(Command("admin_reminders"))
async def cmd_admin_reminders(message: types.Message):
    """Show admin reminders panel"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    text = (
        "🔐 <b>Админ-панель: Напоминания</b>\n\n"
        "/create_reminder_type - Создать тип напоминания\n"
        "/list_reminder_types - Список типов\n"
        "/add_message - Добавить сообщение в пулл\n"
        "/list_messages - Список сообщений\n"
        "/create_streak_msg - Создать поздравление за стрик\n"
        "/list_streak_msgs - Список поздравлений"
    )
    
    await message.answer(text, parse_mode="HTML")

# ========== REMINDER TYPES ==========

@router.message(Command("create_reminder_type"))
async def create_reminder_type(message: types.Message, state: FSMContext):
    """Start creating reminder type"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    await message.answer(
        "📝 <b>Создание типа напоминания</b>\n\n"
        "Введите название типа напоминания:\n"
        "Например: 'ДЗ на завтра' или 'Первое напоминание'",
        parse_mode="HTML"
    )
    await state.set_state(ReminderTypeState.waiting_for_name)

@router.message(ReminderTypeState.waiting_for_name)
async def process_reminder_name(message: types.Message, state: FSMContext):
    """Process reminder type name"""
    await state.update_data(name=message.text)
    
    await message.answer(
        "⏰ Введите время отправки в формате HH:MM\n"
        "Например: 21:00 или 11:30"
    )
    await state.set_state(ReminderTypeState.waiting_for_time)

@router.message(ReminderTypeState.waiting_for_time)
async def process_reminder_time(message: types.Message, state: FSMContext):
    """Process reminder time"""
    time_text = message.text.strip()
    
    # Validate time format
    if not len(time_text) == 5 or ':' not in time_text:
        await message.answer("❌ Неверный формат. Используйте HH:MM")
        return
    
    try:
        hour, minute = map(int, time_text.split(':'))
        if hour < 0 or hour > 23 or minute < 0 or minute > 59:
            raise ValueError
    except:
        await message.answer("❌ Неверное время. Используйте HH:MM (например, 21:00)")
        return
    
    await state.update_data(time=time_text)
    
    # Create keyboard for days selection
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="ПН", callback_data="day_1"),
            InlineKeyboardButton(text="ВТ", callback_data="day_2"),
            InlineKeyboardButton(text="СР", callback_data="day_3"),
            InlineKeyboardButton(text="ЧТ", callback_data="day_4")
        ],
        [
            InlineKeyboardButton(text="ПТ", callback_data="day_5"),
            InlineKeyboardButton(text="СБ", callback_data="day_6"),
            InlineKeyboardButton(text="ВС", callback_data="day_7")
        ],
        [InlineKeyboardButton(text="✅ Готово", callback_data="days_done")]
    ])
    
    await message.answer(
        "📅 Выберите дни недели:\n"
        "Нажимайте на дни для вкл/выкл\n"
        "Когда закончите - нажмите '✅ Готово'",
        reply_markup=keyboard
    )
    await state.update_data(selected_days=[])
    await state.set_state(ReminderTypeState.waiting_for_days)

@router.callback_query(ReminderTypeState.waiting_for_days, F.data.startswith("day_"))
async def toggle_day(callback: types.CallbackQuery, state: FSMContext):
    """Toggle day selection"""
    day = int(callback.data.split('_')[1])
    
    data = await state.get_data()
    selected_days = data.get('selected_days', [])
    
    if day in selected_days:
        selected_days.remove(day)
    else:
        selected_days.append(day)
    
    await state.update_data(selected_days=selected_days)
    
    # Update keyboard with checkmarks
    day_names = {1: "ПН", 2: "ВТ", 3: "СР", 4: "ЧТ", 5: "ПТ", 6: "СБ", 7: "ВС"}
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text=f"{'✓ ' if d in selected_days else ''}{day_names[d]}",
                callback_data=f"day_{d}"
            )
            for d in range(1, 5)
        ],
        [
            InlineKeyboardButton(
                text=f"{'✓ ' if d in selected_days else ''}{day_names[d]}",
                callback_data=f"day_{d}"
            )
            for d in range(5, 8)
        ],
        [InlineKeyboardButton(text="✅ Готово", callback_data="days_done")]
    ])
    
    await callback.message.edit_reply_markup(reply_markup=keyboard)
    await callback.answer()

@router.callback_query(ReminderTypeState.waiting_for_days, F.data == "days_done")
async def finish_reminder_type(callback: types.CallbackQuery, state: FSMContext):
    """Finish creating reminder type"""
    data = await state.get_data()
    name = data['name']
    time = data['time']
    selected_days = data.get('selected_days', [])
    
    if not selected_days:
        await callback.answer("❌ Выберите хотя бы один день!", show_alert=True)
        return
    
    # Create reminder type
    type_id = reminder_type_service.create_reminder_type(
        name=name,
        time_str=time,
        days_of_week=selected_days
    )
    
    if type_id:
        day_names = {1: "ПН", 2: "ВТ", 3: "СР", 4: "ЧТ", 5: "ПТ", 6: "СБ", 7: "ВС"}
        days_str = ", ".join([day_names[d] for d in sorted(selected_days)])
        
        await callback.message.edit_text(
            f"✅ <b>Тип напоминания создан!</b>\n\n"
            f"📝 Название: {name}\n"
            f"⏰ Время: {time}\n"
            f"📅 Дни: {days_str}\n\n"
            f"ID: {type_id}\n\n"
            f"Теперь добавьте сообщения в пулл:\n"
            f"/add_message",
            parse_mode="HTML"
        )
    else:
        await callback.message.edit_text("❌ Ошибка создания типа напоминания")
    
    await state.clear()
    await callback.answer()

@router.message(Command("list_reminder_types"))
async def list_reminder_types(message: types.Message):
    """List all reminder types"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    types_list = reminder_type_service.get_all_reminder_types()
    
    if not types_list:
        await message.answer("📭 Нет созданных типов напоминаний")
        return
    
    text = "<b>📋 Типы напоминаний:</b>\n\n"
    
    day_names = {1: "ПН", 2: "ВТ", 3: "СР", 4: "ЧТ", 5: "ПТ", 6: "СБ", 7: "ВС"}
    
    for rt in types_list:
        days = [int(d) for d in rt.days_of_week.split(',')] if rt.days_of_week else []
        days_str = ", ".join([day_names[d] for d in days])
        
        text += (
            f"<b>#{rt.id}:</b> {rt.name}\n"
            f"⏰ {rt.time.strftime('%H:%M')}\n"
            f"📅 {days_str}\n"
            f"---\n\n"
        )
    
    await message.answer(text, parse_mode="HTML")

# ========== MESSAGE POOL ==========

@router.message(Command("add_message"))
async def add_message(message: types.Message, state: FSMContext):
    """Start adding message to pool"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    # Get all reminder types
    types_list = reminder_type_service.get_all_reminder_types()
    
    if not types_list:
        await message.answer("❌ Сначала создайте типы напоминаний: /create_reminder_type")
        return
    
    # Create keyboard with types
    keyboard_buttons = []
    for rt in types_list:
        keyboard_buttons.append([
            InlineKeyboardButton(
                text=f"{rt.name} ({rt.time.strftime('%H:%M')})",
                callback_data=f"select_type_{rt.id}"
            )
        ])
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=keyboard_buttons)
    
    await message.answer(
        "📝 <b>Добавление сообщения в пулл</b>\n\n"
        "Выберите тип напоминания:",
        reply_markup=keyboard,
        parse_mode="HTML"
    )
    await state.set_state(MessagePoolState.waiting_for_type_selection)

@router.callback_query(MessagePoolState.waiting_for_type_selection, F.data.startswith("select_type_"))
async def select_message_type(callback: types.CallbackQuery, state: FSMContext):
    """Select reminder type for message"""
    type_id = int(callback.data.split('_')[-1])
    await state.update_data(reminder_type_id=type_id)
    
    await callback.message.edit_text(
        "📝 Введите текст сообщения:\n\n"
        "Можно использовать HTML форматирование:\n"
        "<b>жирный</b>, <i>курсив</i>"
    )
    await state.set_state(MessagePoolState.waiting_for_message)
    await callback.answer()

@router.message(MessagePoolState.waiting_for_message)
async def process_message_text(message: types.Message, state: FSMContext):
    """Process message text"""
    await state.update_data(message_text=message.text)
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="➕ Добавить картинку", callback_data="add_image")],
        [InlineKeyboardButton(text="✅ Сохранить без картинки", callback_data="save_no_image")]
    ])
    
    await message.answer(
        "Хотите добавить картинку к сообщению?",
        reply_markup=keyboard
    )

@router.callback_query(MessagePoolState.waiting_for_message, F.data == "add_image")
async def request_image(callback: types.CallbackQuery, state: FSMContext):
    """Request image"""
    await callback.message.edit_text("📸 Отправьте картинку:")
    await state.set_state(MessagePoolState.waiting_for_image)
    await callback.answer()

@router.message(MessagePoolState.waiting_for_image, F.photo)
async def process_image(message: types.Message, state: FSMContext):
    """Process image"""
    status_msg = await message.answer("⏳ Загружаю картинку...")
    
    try:
        # Download photo
        photo = message.photo[-1]
        file = await message.bot.get_file(photo.file_id)
        
        file_bytes = io.BytesIO()
        await message.bot.download_file(file.file_path, file_bytes)
        file_bytes = file_bytes.getvalue()
        
        # Generate filename
        filename = f"reminder_{uuid.uuid4()}.jpg"
        
        # ✅ Получаем UUID пользователя из состояния
        data = await state.get_data()
        user_id = data.get('user_id')  # Это уже UUID из авторизации
        
        if not user_id:
            await status_msg.edit_text("❌ Ошибка: не найден user_id. Попробуйте /start")
            return
        
        # Upload to S3 via API
        photo_response = await api_service.upload_photo(
            user_id=user_id,  # Передаём UUID
            file_data=file_bytes,
            filename=filename
        )
        
        if not photo_response:
            await status_msg.edit_text("❌ Ошибка загрузки картинки. Попробуйте еще раз.")
            return
        
        await status_msg.delete()
        
        # Сохраняем постоянный URL из S3
        await save_message_to_pool(message, state, photo_response.download_url)
        
    except Exception as e:
        logger.error(f"Error uploading reminder image: {e}", exc_info=True)
        try:
            await status_msg.edit_text("❌ Ошибка загрузки")
        except:
            await message.answer("❌ Ошибка загрузки")

@router.callback_query(MessagePoolState.waiting_for_message, F.data == "save_no_image")
async def save_without_image(callback: types.CallbackQuery, state: FSMContext):
    """Save message without image"""
    await save_message_to_pool(callback.message, state, None)
    await callback.answer()

async def save_message_to_pool(message: types.Message, state: FSMContext, image_url=None):
    """Save message to pool"""
    data = await state.get_data()
    reminder_type_id = data['reminder_type_id']
    message_text = data['message_text']
    
    success = reminder_type_service.add_message_to_pool(
        reminder_type_id=reminder_type_id,
        message=message_text,
        image_url=image_url
    )
    
    if success:
        await message.answer(
            "✅ <b>Сообщение добавлено в пулл!</b>\n\n"
            "Добавить еще? /add_message",
            parse_mode="HTML"
        )
    else:
        await message.answer("❌ Ошибка добавления сообщения")
    
    await state.clear()

# ========== STREAK MESSAGES ==========

@router.message(Command("create_streak_msg"))
async def create_streak_message(message: types.Message, state: FSMContext):
    """Create streak congratulation message"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    await message.answer(
        "🎉 <b>Создание поздравления за стрик</b>\n\n"
        "Введите количество дней:\n"
        "Например: 3, 5, 7, 10, 14, 21, 30",
        parse_mode="HTML"
    )
    await state.set_state(StreakMessageState.waiting_for_days)

@router.message(StreakMessageState.waiting_for_days)
async def process_streak_days(message: types.Message, state: FSMContext):
    """Process streak days"""
    try:
        days = int(message.text)
        await state.update_data(streak_days=days)
        
        await message.answer(
            f"📝 Введите текст поздравления для {days} дней:"
        )
        await state.set_state(StreakMessageState.waiting_for_message)
    except:
        await message.answer("❌ Введите число")

@router.message(StreakMessageState.waiting_for_message)
async def process_streak_message(message: types.Message, state: FSMContext):
    """Process streak message"""
    data = await state.get_data()
    days = data['streak_days']
    
    success = streak_service.create_streak_message(days, message.text)
    
    if success:
        await message.answer(
            f"✅ Поздравление для {days} дней создано!"
        )
    else:
        await message.answer("❌ Ошибка создания")
    
    await state.clear()

@router.message(Command("list_streak_msgs"))
async def list_streak_messages(message: types.Message):
    """List all streak messages"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    messages = streak_service.get_all_streak_messages()
    
    if not messages:
        await message.answer("📭 Нет поздравлений за стрики")
        return
    
    text = "<b>🎉 Поздравления за стрики:</b>\n\n"
    
    for msg in messages:
        text += (
            f"<b>{msg.streak_days} дней:</b>\n"
            f"{msg.message[:100]}...\n"
            f"---\n\n"
        )
    
    await message.answer(text, parse_mode="HTML")