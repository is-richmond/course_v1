"""Admin handlers for homework and guarantee management"""

from aiogram import Router, F, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from src.services.homework_service import homework_service
from src.services.guarantee_service import guarantee_service
from src.services.service_streak import streak_service
from src.services.session_service import session_service
from src.utils.logger import get_logger

logger = get_logger(__name__)
router = Router()

# Admin IDs
ADMIN_IDS = [894877615]

def is_admin(user_id: int) -> bool:
    """Check if user is admin"""
    return user_id in ADMIN_IDS

class GuaranteeState(StatesGroup):
    waiting_for_user_id = State()
    waiting_for_status = State()
    waiting_for_notes = State()

# ========== MAIN ADMIN MENU ==========

@router.message(Command("admin_hw"))
async def cmd_admin_hw(message: types.Message):
    """Show admin homework panel"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    text = (
        "🔐 <b>Админ-панель: Домашние задания</b>\n\n"
        "/hw_stats - Общая статистика\n"
        "/user_hw [user_id] - ДЗ пользователя\n"
        "/guarantee_set - Установить гарантию\n"
        "/guarantee_list - Список гарантий\n"
        "/streak_stats - Статистика стриков"
    )
    
    await message.answer(text, parse_mode="HTML")

# ========== HOMEWORK STATS ==========

@router.message(Command("hw_stats"))
async def homework_stats(message: types.Message):
    """Show homework statistics"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    # Get today's stats
    completed_users = homework_service.get_completed_users_today()
    incomplete_users = homework_service.get_incomplete_users_today()
    total_users = session_service.get_user_count()
    
    completed_count = len(completed_users)
    incomplete_count = len(incomplete_users)
    not_started = total_users - completed_count - incomplete_count
    
    completion_rate = (completed_count / total_users * 100) if total_users > 0 else 0
    
    text = (
        f"📊 <b>Статистика ДЗ на сегодня</b>\n\n"
        f"👥 Всего пользователей: {total_users}\n\n"
        f"✅ Выполнили: {completed_count}\n"
        f"⏳ В процессе: {incomplete_count}\n"
        f"❌ Не начали: {not_started}\n\n"
        f"📈 Процент выполнения: {completion_rate:.1f}%"
    )
    
    await message.answer(text, parse_mode="HTML")

@router.message(Command("user_hw"))
async def user_homework(message: types.Message):
    """Show user homework history"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    # Parse user_id from command
    try:
        parts = message.text.split()
        if len(parts) < 2:
            await message.answer(
                "Использование: /user_hw [user_id]\n"
                "Например: /user_hw 123"
            )
            return
        
        user_id = int(parts[1])
    except ValueError:
        await message.answer("❌ Неверный user_id")
        return
    
    # Get homework history
    history = homework_service.get_user_homework_history(user_id, days=7)
    
    if not history:
        await message.answer(f"📭 Нет данных по ДЗ для пользователя {user_id}")
        return
    
    # Get streak info
    streak_info = streak_service.get_user_streak(user_id)
    
    text = (
        f"📚 <b>Домашние задания пользователя {user_id}</b>\n\n"
        f"🔥 Текущая серия: {streak_info['current_streak']} дней\n"
        f"🏆 Лучшая серия: {streak_info['longest_streak']} дней\n\n"
        f"<b>Последние 7 дней:</b>\n\n"
    )
    
    for hw in history:
        date_str = hw.date.strftime('%d.%m')
        status = "✅" if hw.is_complete else "⏳"
        
        anki = "✅" if hw.anki_submitted else "❌"
        test = "✅" if hw.test_submitted else "❌"
        lesson = "✅" if hw.lesson_submitted else "❌"
        
        text += (
            f"{status} <b>{date_str}:</b> "
            f"Anki {anki} | Тест {test} | Урок {lesson}\n"
        )
    
    await message.answer(text, parse_mode="HTML")

# ========== GUARANTEE MANAGEMENT ==========

@router.message(Command("guarantee_set"))
async def guarantee_set_start(message: types.Message, state: FSMContext):
    """Start setting guarantee"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    await message.answer(
        "🛡️ <b>Установка статуса гарантии</b>\n\n"
        "Введите user_id пользователя:",
        parse_mode="HTML"
    )
    await state.set_state(GuaranteeState.waiting_for_user_id)

@router.message(GuaranteeState.waiting_for_user_id)
async def guarantee_get_user_id(message: types.Message, state: FSMContext):
    """Get user ID for guarantee"""
    try:
        user_id = int(message.text)
        await state.update_data(user_id=user_id)
        
        # Create keyboard
        keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
            [
                types.InlineKeyboardButton(text="✅ Включить", callback_data="guarantee_on"),
                types.InlineKeyboardButton(text="❌ Отключить", callback_data="guarantee_off")
            ]
        ])
        
        await message.answer(
            f"Установить гарантию для пользователя {user_id}:",
            reply_markup=keyboard
        )
        await state.set_state(GuaranteeState.waiting_for_status)
    except ValueError:
        await message.answer("❌ Неверный user_id. Введите число:")

@router.callback_query(GuaranteeState.waiting_for_status)
async def guarantee_set_status(callback: types.CallbackQuery, state: FSMContext):
    """Set guarantee status"""
    data = await state.get_data()
    user_id = data['user_id']
    
    has_guarantee = callback.data == "guarantee_on"
    await state.update_data(has_guarantee=has_guarantee)
    
    if not has_guarantee:
        await callback.message.edit_text(
            "Введите причину отключения гарантии\n"
            "(или отправьте '-' если не нужно):"
        )
        await state.set_state(GuaranteeState.waiting_for_notes)
    else:
        # Set guarantee immediately
        success = guarantee_service.set_guarantee_status(
            user_id=user_id,
            has_guarantee=True,
            admin_id=str(callback.from_user.id)
        )
        
        if success:
            await callback.message.edit_text(
                f"✅ Гарантия включена для пользователя {user_id}"
            )
        else:
            await callback.message.edit_text("❌ Ошибка установки гарантии")
        
        await state.clear()
    
    await callback.answer()

@router.message(GuaranteeState.waiting_for_notes)
async def guarantee_set_notes(message: types.Message, state: FSMContext):
    """Set guarantee notes"""
    data = await state.get_data()
    user_id = data['user_id']
    has_guarantee = data['has_guarantee']
    
    notes = None if message.text == '-' else message.text
    
    success = guarantee_service.set_guarantee_status(
        user_id=user_id,
        has_guarantee=has_guarantee,
        admin_id=str(message.from_user.id),
        notes=notes
    )
    
    if success:
        status = "включена" if has_guarantee else "отключена"
        await message.answer(f"✅ Гарантия {status} для пользователя {user_id}")
    else:
        await message.answer("❌ Ошибка установки гарантии")
    
    await state.clear()

@router.message(Command("guarantee_list"))
async def guarantee_list(message: types.Message):
    """List all guarantees"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    guarantees = guarantee_service.get_all_users_guarantee()
    
    if not guarantees:
        await message.answer("📭 Нет данных по гарантиям")
        return
    
    active_count = sum(1 for g in guarantees if g.has_guarantee)
    inactive_count = len(guarantees) - active_count
    
    text = (
        f"🛡️ <b>Статус гарантий</b>\n\n"
        f"✅ Активных: {active_count}\n"
        f"❌ Неактивных: {inactive_count}\n"
        f"📊 Всего: {len(guarantees)}\n\n"
        f"<b>Пользователи без гарантии:</b>\n"
    )
    
    for guarantee in guarantees:
        if not guarantee.has_guarantee:
            notes = f" ({guarantee.notes[:30]}...)" if guarantee.notes else ""
            text += f"• User {guarantee.user_id}{notes}\n"
    
    await message.answer(text, parse_mode="HTML")

# ========== STREAK STATS ==========

@router.message(Command("streak_stats"))
async def streak_stats(message: types.Message):
    """Show streak statistics"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    # Get all user IDs
    all_users = list(session_service.user_chats.keys())
    
    if not all_users:
        await message.answer("📭 Нет активных пользователей")
        return
    
    # Get streaks for all users
    streaks = []
    for user_id in all_users:
        streak_info = streak_service.get_user_streak(user_id)
        if streak_info['current_streak'] > 0:
            streaks.append((user_id, streak_info['current_streak']))
    
    # Sort by streak
    streaks.sort(key=lambda x: x[1], reverse=True)
    
    text = (
        f"🔥 <b>Статистика стриков</b>\n\n"
        f"Пользователей с активной серией: {len(streaks)}\n\n"
        f"<b>Топ-10:</b>\n"
    )
    
    for i, (user_id, streak) in enumerate(streaks[:10], 1):
        text += f"{i}. User {user_id}: {streak} дней\n"
    
    await message.answer(text, parse_mode="HTML")