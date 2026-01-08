"""Admin handlers for homework schedule management"""

from aiogram import Router, F, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from src.services.homework_schedule_service import homework_schedule_service
from src. utils.logger import get_logger

logger = get_logger(__name__)
router = Router()

# Admin IDs
ADMIN_IDS = [894877615]

def is_admin(user_id: int) -> bool:
    """Check if user is admin"""
    return user_id in ADMIN_IDS

class ScheduleState(StatesGroup):
    waiting_for_name = State()
    waiting_for_days = State()

# ========== MAIN MENU ==========

@router.message(Command("admin_schedule"))
async def cmd_admin_schedule(message: types.Message):
    """Show schedule admin menu"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    text = (
        "📅 <b>Управление расписанием ДЗ</b>\n\n"
        "/create_schedule - Создать новое расписание\n"
        "/list_schedules - Список расписаний\n"
        "/edit_schedule - Редактировать расписание\n"
        "/set_default_schedule - Установить как основное"
    )
    
    await message.answer(text, parse_mode="HTML")

# ========== CREATE SCHEDULE ==========

@router.message(Command("create_schedule"))
async def create_schedule_start(message: types.Message, state: FSMContext):
    """Start creating schedule"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    await message.answer(
        "📝 <b>Создание расписания ДЗ</b>\n\n"
        "Введите название расписания:\n"
        "Наприме��: 'Основное' или 'Летний курс'",
        parse_mode="HTML"
    )
    await state.set_state(ScheduleState.waiting_for_name)

@router.message(ScheduleState.waiting_for_name)
async def process_schedule_name(message: types.Message, state: FSMContext):
    """Process schedule name"""
    await state.update_data(name=message.text)
    
    # Create keyboard for days
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
        [InlineKeyboardButton(text="✅ Готово", callback_data="schedule_done")]
    ])
    
    await message.answer(
        "📅 <b>Выберите дни с ДЗ</b>\n\n"
        "Нажимайте на дни для вкл/выкл\n"
        "Когда закончите - нажмите '✅ Готово'",
        reply_markup=keyboard,
        parse_mode="HTML"
    )
    await state.update_data(selected_days=[])
    await state.set_state(ScheduleState.waiting_for_days)

@router.callback_query(ScheduleState. waiting_for_days, F.data. startswith("day_"))
async def toggle_schedule_day(callback: types.CallbackQuery, state: FSMContext):
    """Toggle day selection"""
    day = int(callback.data.split('_')[1])
    
    data = await state.get_data()
    selected_days = data. get('selected_days', [])
    
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
        [InlineKeyboardButton(text="✅ Готово", callback_data="schedule_done")]
    ])
    
    await callback.message.edit_reply_markup(reply_markup=keyboard)
    await callback.answer()

@router.callback_query(ScheduleState. waiting_for_days, F.data == "schedule_done")
async def finish_schedule_creation(callback: types.CallbackQuery, state: FSMContext):
    """Finish schedule creation"""
    data = await state.get_data()
    name = data['name']
    selected_days = data.get('selected_days', [])
    
    if not selected_days:
        await callback.answer("❌ Выберите хотя бы один день!", show_alert=True)
        return
    
    # Create schedule
    schedule_id = homework_schedule_service.create_schedule(
        name=name,
        days_of_week=selected_days
    )
    
    if schedule_id:
        day_names = {1: "ПН", 2: "ВТ", 3: "СР", 4: "ЧТ", 5: "ПТ", 6: "СБ", 7: "ВС"}
        days_str = ", ".join([day_names[d] for d in sorted(selected_days)])
        
        await callback.message.edit_text(
            f"✅ <b>Расписание создано!  </b>\n\n"
            f"📝 Название: {name}\n"
            f"📅 Дни: {days_str}\n"
            f"ID: {schedule_id}",
            parse_mode="HTML"
        )
    else:
        await callback.message.edit_text("❌ Ошибка создания расписания")
    
    await state.clear()
    await callback.answer()

# ========== LIST SCHEDULES ==========

@router.message(Command("list_schedules"))
async def list_schedules(message: types. Message):
    """List all schedules"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    schedules = homework_schedule_service.get_all_schedules()
    
    if not schedules:
        await message.answer("📭 Нет расписаний")
        return
    
    text = "<b>📅 Расписания ДЗ:</b>\n\n"
    
    day_names = {1: "ПН", 2: "ВТ", 3: "СР", 4: "ЧТ", 5: "ПТ", 6: "СБ", 7: "ВС"}
    
    for schedule in schedules:
        days = [int(d) for d in schedule.days_of_week. split(',')] if schedule.days_of_week else []
        days_str = ", ".join([day_names[d] for d in days])
        
        text += (
            f"<b>#{schedule.id}:</b> {schedule.name}\n"
            f"📅 {days_str}\n"
            f"---\n\n"
        )
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="➕ Новое расписание", callback_data="create_new_schedule")],
        [InlineKeyboardButton(text="✏️ Редактировать", callback_data="edit_schedule_menu")],
    ])
    
    await message. answer(text, reply_markup=keyboard, parse_mode="HTML")

# ========== EDIT SCHEDULE ==========

@router.message(Command("edit_schedule"))
async def edit_schedule_start(message: types.Message, state: FSMContext):
    """Start editing schedule"""
    if not is_admin(message.from_user.id):
        await message. answer("❌ У вас нет доступа")
        return
    
    schedules = homework_schedule_service. get_all_schedules()
    
    if not schedules: 
        await message.answer("📭 Нет расписаний для редактирования")
        return
    
    # Create keyboard with schedules
    keyboard_buttons = []
    for schedule in schedules:
        keyboard_buttons.append([
            InlineKeyboardButton(
                text=f"#{schedule.id}:  {schedule.name}",
                callback_data=f"edit_schedule_{schedule.id}"
            )
        ])
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=keyboard_buttons)
    
    await message. answer(
        "📝 Выберите расписание для редактирования:",
        reply_markup=keyboard
    )

@router.callback_query(F.data.startswith("edit_schedule_"))
async def select_schedule_to_edit(callback: types.CallbackQuery, state: FSMContext):
    """Select schedule to edit"""
    schedule_id = int(callback.data.split('_')[-1])
    schedule = homework_schedule_service.get_schedule(schedule_id)
    
    if not schedule:
        await callback.answer("❌ Расписание не найдено", show_alert=True)
        return
    
    await state. update_data(edit_schedule_id=schedule_id)
    
    # Parse current days
    current_days = [int(d) for d in schedule.days_of_week.split(',')] if schedule.days_of_week else []
    await state.update_data(selected_days=current_days)
    
    # Create keyboard
    day_names = {1: "ПН", 2: "ВТ", 3: "СР", 4: "ЧТ", 5: "ПТ", 6: "СБ", 7: "ВС"}
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text=f"{'✓ ' if d in current_days else ''}{day_names[d]}",
                callback_data=f"edit_day_{d}"
            )
            for d in range(1, 5)
        ],
        [
            InlineKeyboardButton(
                text=f"{'✓ ' if d in current_days else ''}{day_names[d]}",
                callback_data=f"edit_day_{d}"
            )
            for d in range(5, 8)
        ],
        [InlineKeyboardButton(text="💾 Сохранить", callback_data="save_edited_schedule")]
    ])
    
    text = (
        f"✏️ <b>Редактирование расписания</b>\n\n"
        f"📝 Название: {schedule.name}\n"
        f"Выберите дни:"
    )
    
    await callback.message.edit_text(text, reply_markup=keyboard, parse_mode="HTML")
    await callback.answer()

@router.callback_query(F. data.startswith("edit_day_"))
async def toggle_edit_day(callback: types.CallbackQuery, state: FSMContext):
    """Toggle day in edit mode"""
    day = int(callback.data.split('_')[-1])
    
    data = await state.get_data()
    selected_days = data. get('selected_days', [])
    schedule_id = data.get('edit_schedule_id')
    
    if day in selected_days: 
        selected_days.remove(day)
    else:
        selected_days.append(day)
    
    await state.update_data(selected_days=selected_days)
    
    # Update keyboard
    day_names = {1: "ПН", 2: "ВТ", 3: "СР", 4: "ЧТ", 5: "ПТ", 6: "СБ", 7: "ВС"}
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text=f"{'✓ ' if d in selected_days else ''}{day_names[d]}",
                callback_data=f"edit_day_{d}"
            )
            for d in range(1, 5)
        ],
        [
            InlineKeyboardButton(
                text=f"{'✓ ' if d in selected_days else ''}{day_names[d]}",
                callback_data=f"edit_day_{d}"
            )
            for d in range(5, 8)
        ],
        [InlineKeyboardButton(text="💾 Сохранить", callback_data="save_edited_schedule")]
    ])
    
    await callback.message. edit_reply_markup(reply_markup=keyboard)
    await callback.answer()

@router.callback_query(F.data == "save_edited_schedule")
async def save_edited_schedule(callback: types.CallbackQuery, state: FSMContext):
    """Save edited schedule"""
    data = await state.get_data()
    schedule_id = data.get('edit_schedule_id')
    selected_days = data.get('selected_days', [])
    
    if not selected_days: 
        await callback.answer("❌ Выберите хотя бы один день!", show_alert=True)
        return
    
    # Update schedule
    success = homework_schedule_service.update_schedule(
        schedule_id=schedule_id,
        days_of_week=selected_days
    )
    
    if success:
        day_names = {1: "ПН", 2: "ВТ", 3: "СР", 4: "ЧТ", 5: "ПТ", 6: "СБ", 7: "ВС"}
        days_str = ", ".join([day_names[d] for d in sorted(selected_days)])
        
        await callback.message.edit_text(
            f"✅ <b>Расписание обновлено!</b>\n\n"
            f"📅 Новые дни: {days_str}",
            parse_mode="HTML"
        )
    else:
        await callback.message.edit_text("❌ Ошибка обновления расписания")
    
    await state.clear()
    await callback. answer()

# ========== SET DEFAULT SCHEDULE ==========

@router. message(Command("set_default_schedule"))
async def set_default_schedule(message: types.Message):
    """Set default schedule"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    schedules = homework_schedule_service. get_all_schedules()
    
    if not schedules: 
        await message.answer("📭 Нет расписаний")
        return
    
    keyboard_buttons = []
    for schedule in schedules:
        keyboard_buttons.append([
            InlineKeyboardButton(
                text=f"#{schedule.id}: {schedule.name}",
                callback_data=f"set_default_{schedule.id}"
            )
        ])
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=keyboard_buttons)
    
    await message.answer(
        "📌 Выберите расписание как основное:",
        reply_markup=keyboard
    )

@router.callback_query(F.data. startswith("set_default_"))
async def confirm_default_schedule(callback: types.CallbackQuery):
    """Set schedule as default"""
    schedule_id = int(callback.data.split('_')[-1])
    
    # Update in config or database
    success = homework_schedule_service.set_as_default(schedule_id)
    
    if success:
        await callback.message.edit_text(
            f"✅ Расписание #{schedule_id} установлено как основное"
        )
    else:
        await callback.message.edit_text("❌ Ошибка установки")
    
    await callback.answer()