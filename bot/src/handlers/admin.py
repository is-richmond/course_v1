

"""Admin handlers for reminders and broadcasts"""

from aiogram import Router, F, types
from aiogram.filters import Command, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from datetime import datetime, timedelta
from src.services.reminder_service import reminder_service
from src.services.session_service import session_service
from src.utils.logger import get_logger

logger = get_logger(__name__)
router = Router()

# Admin ID - измени на свой ID
ADMIN_IDS = [894877615]  # Добавь IDs админов

class ReminderState(StatesGroup):
    waiting_for_title = State()
    waiting_for_from_user = State()
    waiting_for_message = State()
    waiting_for_schedule = State()
    confirm_send = State()

def is_admin(user_id: int) -> bool:
    """Check if user is admin"""
    return user_id in ADMIN_IDS

@router.message(Command("admin"))
async def cmd_admin(message: types.Message):
    """Admin panel"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа к админ-панели")
        return
    
    user_count = session_service.get_user_count()
    
    admin_text = (
        "🔐 <b>Админ-панель</b>\n\n"
        f"👥 Активных пользователей: <b>{user_count}</b>\n\n"
        "/create_reminder - Создать сообщение\n"
        "/queue - Очередь отправки\n"
        "/list_reminders - История сообщений\n"
        "/scheduled - Запланированные сообщения\n"
        "/help - Справка"
    )
    
    await message.answer(admin_text, parse_mode="HTML")


@router.message(Command("create_reminder"))
async def cmd_create_reminder(message: types. Message, state: FSMContext):
    """Start creating reminder"""
    if not is_admin(message.from_user.id):
        await message. answer("❌ У вас нет доступа")
        return
    
    user_count = session_service.get_user_count()
    
    if user_count == 0:
        await message. answer("❌ Нет активных пользователей для рассылки")
        return
    
    await message.answer(
        f"📝 Введите заголовок сообщения\n\n"
        f"<i>Будет отправлено {user_count} пользователям</i>",
        parse_mode="HTML"
    )
    await state.set_state(ReminderState.waiting_for_title)


@router.message(ReminderState.waiting_for_title)
async def process_title(message: types.Message, state: FSMContext):
    """Process reminder title"""
    await state.update_data(title=message.text)
    await message.answer("👤 От кого это сообщение?  (введите имя/должность):")
    await state.set_state(ReminderState.waiting_for_from_user)


@router.message(ReminderState.waiting_for_from_user)
async def process_from_user(message: types.Message, state: FSMContext):
    """Process from_user field"""
    await state.update_data(from_user=message. text)
    await message.answer("📄 Теперь введите текст сообщения:")
    await state.set_state(ReminderState.waiting_for_message)


@router.message(ReminderState.waiting_for_message)
async def process_message(message: types.Message, state: FSMContext):
    """Process reminder message"""
    await state.update_data(message=message.text)
    
    keyboard = types.InlineKeyboardMarkup(
        inline_keyboard=[
            [
                types.InlineKeyboardButton(text="⏱️ Отложенная отправка", callback_data="schedule"),
                types.InlineKeyboardButton(text="📤 Отправить сейчас", callback_data="send_now")
            ]
        ]
    )
    
    await message.answer(
        "⏰ Выберите способ отправки:",
        reply_markup=keyboard
    )
    await state.set_state(ReminderState. waiting_for_schedule)


@router.callback_query(ReminderState. waiting_for_schedule)
async def schedule_choice(query: types.CallbackQuery, state: FSMContext):
    """Choose between immediate or scheduled send"""
    if query.data == "schedule": 
        await query.message.edit_text(
            "⏰ Введите время отправки в формате:\n"
            "HH:MM (например:  14:30)\n\n"
            "или дату и время:\n"
            "ДД.MM.ГГГГ HH:MM (например:  05.01.2026 14:30)\n\n"
            "или через сколько часов:\n"
            "1h, 2h, 12h и т.д."
        )
        await state. update_data(scheduled=True)
    else:
        await state.update_data(scheduled=False)
        await show_preview(query, state)


@router.message(ReminderState.waiting_for_schedule)
async def process_schedule(message: types.Message, state: FSMContext):
    """Process schedule time"""
    time_text = message.text. strip()
    scheduled_at = parse_schedule_time(time_text)
    
    if not scheduled_at:
        await message.answer(
            "❌ Неправильный формат времени!\n\n"
            "Используйте:\n"
            "HH:MM или ДД.MM.ГГГГ HH:MM или 2h"
        )
        return
    
    await state.update_data(scheduled_at=scheduled_at)
    await show_preview(None, state, message)


async def show_preview(query: types.CallbackQuery = None, state: FSMContext = None, message: types.Message = None):
    """Show preview and confirm"""
    data = await state.get_data()
    title = data.get("title")
    from_user = data.get("from_user")
    reminder_text = data.get("message")
    scheduled_at = data.get("scheduled_at")
    user_count = session_service.get_user_count()
    
    now = datetime.now()
    
    if scheduled_at:
        schedule_text = f"⏰ Запланировано:  {scheduled_at.strftime('%d.%m.%Y %H:%M')}"
    else:
        schedule_text = "📤 Отправится сейчас"
    
    preview = (
        f"📌 <b>Предпросмотр</b>:\n\n"
        f"<b>{title}</b>\n"
        f"От: {from_user}\n"
        f"📅 Создано: {now.strftime('%d.%m.%Y %H:%M')}\n\n"
        f"─────────────\n"
        f"{reminder_text}\n"
        f"─────────────\n\n"
        f"{schedule_text}\n"
        f"👥 Получат: {user_count} пользователей"
    )
    
    keyboard = types.InlineKeyboardMarkup(
        inline_keyboard=[
            [
                types.InlineKeyboardButton(text="✅ Подтвердить", callback_data="confirm_send"),
                types.InlineKeyboardButton(text="❌ Отмена", callback_data="cancel_send")
            ]
        ]
    )
    
    if query:
        await query.message.edit_text(preview, reply_markup=keyboard, parse_mode="HTML")
    else:
        await message.answer(preview, reply_markup=keyboard, parse_mode="HTML")
    
    await state.set_state(ReminderState.confirm_send)


@router.callback_query(ReminderState. confirm_send)
async def confirm_reminder(query: types.CallbackQuery, state: FSMContext):
    """Confirm and send reminder"""
    data = await state.get_data()
    title = data.get("title")
    from_user = data.get("from_user")
    reminder_text = data.get("message")
    scheduled_at = data.get("scheduled_at")
    admin_id = str(query.from_user.id)
    
    if query.data == "confirm_send": 
        # Создаем напоминание в БД
        reminder = reminder_service.create_reminder(
            title=title,
            message=reminder_text,
            from_user=from_user,
            admin_id=admin_id,
            scheduled_at=scheduled_at
        )
        
        # Если нет расписания - отправляем сейчас
        if not scheduled_at: 
            broadcast = session_service.add_to_queue(
                reminder_id=reminder.id,
                title=title,
                message=reminder_text,
                admin_id=admin_id
            )
            
            await query.message.edit_text("✅ Сообщение создано и начинаем отправку...")
            
            # Отправляем всем
            sent, failed = await send_broadcast(
                query.bot,
                reminder.id,
                title,
                from_user,
                reminder_text,
                reminder.created_at
            )
            
            reminder_service.mark_as_sent(reminder.id, sent, failed)
            session_service.complete_broadcast(broadcast["id"], sent, failed)
            
            await query.message.answer(
                f"📊 <b>Отчет отправки</b>:\n\n"
                f"✅ Успешно: {sent}\n"
                f"❌ Ошибок: {failed}\n"
                f"📈 Всего: {sent + failed}",
                parse_mode="HTML"
            )
        else:
            await query.message.edit_text(
                f"✅ Сообщение запланировано!\n\n"
                f"⏰ Будет отправлено:  {scheduled_at.strftime('%d.%m.%Y %H:%M')}"
            )
    else:
        await query.message. edit_text("❌ Отменено")
    
    await state.clear()


async def send_broadcast(bot, reminder_id:  int, title: str, from_user: str, message: str, created_at: datetime) -> tuple: 
    """Send broadcast to all users"""
    chat_ids = session_service.get_all_chat_ids()
    
    sent = 0
    failed = 0
    
    text = (
        f"📌 <b>{title}</b>\n"
        f"👤 От: {from_user}\n"
        f"📅 Дата: {created_at.strftime('%d.%m.%Y %H:%M')}\n\n"
        f"─────────────\n"
        f"{message}\n"
        f"─────────────"
    )
    
    for chat_id in chat_ids: 
        try:
            await bot.send_message(
                chat_id=chat_id,
                text=text,
                parse_mode="HTML"
            )
            sent += 1
        except Exception as e:
            logger.error(f"Failed to send to {chat_id}: {e}")
            failed += 1
    
    return sent, failed


@router.message(Command("scheduled"))
async def cmd_scheduled(message: types.Message):
    """Show scheduled reminders"""
    if not is_admin(message.from_user.id):
        await message. answer("❌ У вас нет доступа")
        return
    
    pending = reminder_service.get_pending_reminders()
    
    if not pending:
        await message.answer("📭 Запланированных сообщений нет")
        return
    
    text = f"⏰ <b>Запланированные сообщения ({len(pending)})</b>:\n\n"
    
    for reminder in pending:
        text += (
            f"<b>#{reminder.id}:</b> {reminder.title}\n"
            f"От: {reminder.from_user}\n"
            f"📅 Отправится: {reminder.scheduled_at. strftime('%d.%m. %Y %H:%M')}\n"
            f"---\n\n"
        )
    
    await message.answer(text, parse_mode="HTML")


@router.message(Command("list_reminders"))
async def cmd_list_reminders(message: types.Message):
    """List all sent reminders"""
    if not is_admin(message.from_user.id):
        await message. answer("❌ У вас нет доступа")
        return
    
    reminders = reminder_service.get_all_reminders()
    
    if not reminders:
        await message.answer("📭 Сообщений нет")
        return
    
    text = f"📌 <b>История сообщений ({len(reminders)})</b>:\n\n"
    
    for reminder in reminders:
        status = "✅ Отправлено" if reminder.sent_at else "⏳ Ожидает"
        sent_info = f" ({reminder.sent_count} отправлено)" if reminder.sent_count > 0 else ""
        
        text += (
            f"<b>#{reminder.id}:</b> {reminder.title}\n"
            f"От: {reminder.from_user}\n"
            f"Статус: {status}{sent_info}\n"
            f"Создано: {reminder.created_at.strftime('%d.%m.%Y %H:%M')}\n"
            f"---\n\n"
        )
    
    await message.answer(text, parse_mode="HTML")


def parse_schedule_time(time_text: str) -> datetime:
    """Parse schedule time string"""
    now = datetime.now()
    
    # Format: 1h, 2h, etc
    if time_text.endswith('h'):
        try:
            hours = int(time_text[:-1])
            return now + timedelta(hours=hours)
        except: 
            return None
    
    # Format: HH:MM
    if len(time_text) == 5 and ': ' in time_text:
        try:
            parts = time_text.split(':')
            hour = int(parts[0])
            minute = int(parts[1])
            scheduled = now. replace(hour=hour, minute=minute, second=0, microsecond=0)
            
            # If time is in past, schedule for next day
            if scheduled <= now:
                scheduled += timedelta(days=1)
            
            return scheduled
        except: 
            return None
    
    # Format: ДД.MM.ГГГГ HH:MM
    try:
        return datetime.strptime(time_text, '%d.%m.%Y %H:%M')
    except:
        return None