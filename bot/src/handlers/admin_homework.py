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
ADMIN_IDS = [894877615, 631950456]

def is_admin(user_id: int) -> bool:
    """Check if user is admin"""
    return user_id in ADMIN_IDS


class StreakManagementState(StatesGroup):
    waiting_for_user_id = State()
    waiting_for_action = State()
    waiting_for_value = State()
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
        "<b>Админ-панель: Домашние задания</b>\n\n"
        "/hw_stats - Общая статистика\n"
        "/users - Список активных пользователей\n"
        "/user_hw [user_id] - ДЗ пользователя\n"
        "/guarantee_set - Установить гарантию\n"
        "/guarantee_list - Список гарантий\n"
        "/streak_stats - Статистика стриков\n\n"
        "<b>Управление сериями:</b>\n"
        "/streak_set [user_id] [значение] - Установить серию\n"
        "/streak_adjust [user_id] [+/-число] - Изменить серию\n"
        "/streak_manage - Интерактивное управление"
    )
    
    await message.answer(text, parse_mode="HTML")

# ========== HOMEWORK STATS ==========

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
    
    # Get user info
    info = session_service.get_user_info(user_id)
    name_parts = []
    if info.get('first_name'):
        name_parts.append(info['first_name'])
    if info.get('last_name'):
        name_parts.append(info['last_name'])
    
    display_name = " ".join(name_parts) if name_parts else f"User {user_id}"
    username_str = f" (@{info.get('username')})" if info.get('username') else ""
    
    # Get homework history
    history = homework_service.get_user_homework_history(user_id, days=7)
    
    if not history:
        await message.answer(f"📭 Нет данных по ДЗ для пользователя {display_name}")
        return
    
    # Get streak info
    streak_info = streak_service.get_user_streak(user_id)
    
    text = (
        f"📚 <b>ДЗ: {display_name}</b>{username_str}\n"
        f"ID: <code>{user_id}</code>\n\n"
        f"🔥 Текущая серия: {streak_info['current_streak']} дней\n"
        f"🏆 Лучшая серия: {streak_info['longest_streak']} дней\n\n"
        f"<b>Последние 7 дней:</b>\n\n"
    )
    
    for hw in history:
        date_str = hw.date.strftime('%d.%m')
        status = "✅" if hw.is_complete else "��"
        
        anki = "✅" if hw.anki_submitted else "❌"
        test = "✅" if hw.test_submitted else "❌"
        lesson = "✅" if hw.lesson_submitted else "❌"
        
        text += (
            f"{status} <b>{date_str}:</b> "
            f"Anki {anki} | Тест {test} | Урок {lesson}\n"
        )
    
    # Add quick action button
    keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
        [
            types.InlineKeyboardButton(
                text="🔥 Управлять серией", 
                callback_data=f"manage_streak_{user_id}"
            )
        ]
    ])
    
    await message.answer(text, reply_markup=keyboard, parse_mode="HTML")

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
    """Show streak statistics with user names"""
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
            info = session_service.get_user_info(user_id)
            streaks.append({
                "user_id": user_id,
                "streak": streak_info['current_streak'],
                "username": info.get("username"),
                "first_name": info.get("first_name"),
                "last_name": info.get("last_name")
            })
    
    # Sort by streak
    streaks.sort(key=lambda x: x['streak'], reverse=True)
    
    text = (
        f"🔥 <b>Статистика стриков</b>\n\n"
        f"Пользователей с активной серией: {len(streaks)}\n\n"
        f"<b>Топ-10:</b>\n\n"
    )
    
    # Create inline buttons for top users
    keyboard_buttons = []
    
    for i, user in enumerate(streaks[:10], 1):
        # Format name
        name_parts = []
        if user['first_name']:
            name_parts.append(user['first_name'])
        if user['last_name']:
            name_parts.append(user['last_name'])
        
        display_name = " ".join(name_parts) if name_parts else "Без имени"
        username_str = f" @{user['username']}" if user['username'] else ""
        
        text += (
            f"{i}. <b>{display_name}</b>{username_str}\n"
            f"   <code>{user['user_id']}</code> • 🔥 {user['streak']} дней\n\n"
        )
        
        # Add button for each user (первые 5)
        if i <= 5:
            button_text = f"{display_name[:15]} ({user['streak']} дней)"
            keyboard_buttons.append([
                types.InlineKeyboardButton(
                    text=button_text,
                    callback_data=f"manage_streak_{user['user_id']}"
                )
            ])
    
    keyboard = types.InlineKeyboardMarkup(inline_keyboard=keyboard_buttons)
    
    await message.answer(text, reply_markup=keyboard, parse_mode="HTML")



    # ========== MANUAL STREAK MANAGEMENT ==========

@router.message(Command("streak_set"))
async def streak_set_command(message: types.Message):
    """Quick command to set streak: /streak_set [user_id] [value]"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    try:
        parts = message.text.split()
        if len(parts) < 3:
            await message.answer(
                "📝 <b>Использование:</b>\n"
                "/streak_set [user_id] [значение]\n\n"
                "<b>Примеры:</b>\n"
                "/streak_set 123456 10 - установить серию в 10 дней\n"
                "/streak_set 123456 0 - сбросить серию\n\n"
                "Или используйте /streak_manage для пошагового ввода",
                parse_mode="HTML"
            )
            return
        
        user_id = str(parts[1])
        new_streak = int(parts[2])
        
        if new_streak < 0:
            await message.answer("❌ Значение серии не может быть отрицательным")
            return
        
        # Get current streak
        current_info = streak_service.get_user_streak(user_id)
        
        # Set new streak
        success = streak_service.set_streak_manually(user_id, new_streak)
        
        if success:
            await message.answer(
                f"✅ <b>Серия изменена для пользователя {user_id}</b>\n\n"
                f"Было: {current_info['current_streak']} дней\n"
                f"Стало: {new_streak} дней",
                parse_mode="HTML"
            )
            logger.info(f"Admin {message.from_user.id} set streak for user {user_id}: {new_streak}")
        else:
            await message.answer("❌ Ошибка изменения серии")
            
    except ValueError:
        await message.answer("❌ Неверный формат. Используйте числа.")
    except Exception as e:
        logger.error(f"Error in streak_set_command: {e}")
        await message.answer("❌ Произошла ошибка")


@router.message(Command("streak_adjust"))
async def streak_adjust_command(message: types.Message):
    """Quick command to adjust streak: /streak_adjust [user_id] [+/-value]"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    try:
        parts = message.text.split()
        if len(parts) < 3:
            await message.answer(
                "📝 <b>Использование:</b>\n"
                "/streak_adjust [user_id] [изменение]\n\n"
                "<b>Примеры:</b>\n"
                "/streak_adjust 123456 +5 - добавить 5 дней\n"
                "/streak_adjust 123456 -3 - убрать 3 дня\n\n"
                "Или используйте /streak_manage для пошагового ввода",
                parse_mode="HTML"
            )
            return
        
        user_id = str(parts[1])
        adjustment = int(parts[2])
        
        # Get current streak
        current_info = streak_service.get_user_streak(user_id)
        
        # Adjust streak
        success = streak_service.adjust_streak(user_id, adjustment)
        
        if success:
            new_info = streak_service.get_user_streak(user_id)
            await message.answer(
                f"✅ <b>Серия изменена для пользователя {user_id}</b>\n\n"
                f"Было: {current_info['current_streak']} дней\n"
                f"Изменение: {adjustment:+d} дней\n"
                f"Стало: {new_info['current_streak']} дней",
                parse_mode="HTML"
            )
            logger.info(f"Admin {message.from_user.id} adjusted streak for user {user_id}: {adjustment:+d}")
        else:
            await message.answer("❌ Ошибка изменения серии")
            
    except ValueError:
        await message.answer("❌ Неверный формат. Используйте числа.")
    except Exception as e:
        logger.error(f"Error in streak_adjust_command: {e}")
        await message.answer("❌ Произошла ошибка")


@router.message(Command("streak_manage"))
async def streak_manage_start(message: types.Message, state: FSMContext):
    """Interactive streak management with step-by-step input"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    await message.answer(
        "🔥 <b>Управление серией пользователя</b>\n\n"
        "Введите user_id пользователя:",
        parse_mode="HTML"
    )
    await state.set_state(StreakManagementState.waiting_for_user_id)


@router.message(StreakManagementState.waiting_for_user_id)
async def streak_manage_get_user(message: types.Message, state: FSMContext):
    """Get user ID for streak management"""
    try:
        user_id = str(message.text.strip())
        
        # Get current streak info
        streak_info = streak_service.get_user_streak(user_id)
        
        await state.update_data(user_id=user_id, current_streak=streak_info['current_streak'])
        
        # Create action keyboard
        keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
            [
                types.InlineKeyboardButton(text="📝 Установить значение", callback_data="streak_action_set"),
            ],
            [
                types.InlineKeyboardButton(text="➕ Добавить дни", callback_data="streak_action_add"),
                types.InlineKeyboardButton(text="➖ Убрать дни", callback_data="streak_action_subtract"),
            ],
            [
                types.InlineKeyboardButton(text="🔄 Сбросить в 0", callback_data="streak_action_reset"),
            ],
            [
                types.InlineKeyboardButton(text="❌ Отмена", callback_data="streak_action_cancel"),
            ]
        ])
        
        await message.answer(
            f"👤 <b>Пользователь:</b> {user_id}\n"
            f"🔥 <b>Текущая серия:</b> {streak_info['current_streak']} дней\n"
            f"🏆 <b>Лучшая серия:</b> {streak_info['longest_streak']} дней\n\n"
            f"Выберите действие:",
            reply_markup=keyboard,
            parse_mode="HTML"
        )
        await state.set_state(StreakManagementState.waiting_for_action)
        
    except Exception as e:
        logger.error(f"Error in streak_manage_get_user: {e}")
        await message.answer("❌ Ошибка получения данных пользователя")
        await state.clear()


@router.callback_query(StreakManagementState.waiting_for_action)
async def streak_manage_action(callback: types.CallbackQuery, state: FSMContext):
    """Handle action selection"""
    data = await state.get_data()
    user_id = data['user_id']
    current_streak = data['current_streak']
    
    action = callback.data.replace("streak_action_", "")
    
    if action == "cancel":
        await callback.message.edit_text("❌ Отменено")
        await state.clear()
        await callback.answer()
        return
    
    if action == "reset":
        # Reset immediately
        success = streak_service.set_streak_manually(user_id, 0)
        
        if success:
            await callback.message.edit_text(
                f"✅ <b>Серия сброшена</b>\n\n"
                f"Пользователь: {user_id}\n"
                f"Было: {current_streak} дней\n"
                f"Стало: 0 дней",
                parse_mode="HTML"
            )
            logger.info(f"Admin {callback.from_user.id} reset streak for user {user_id}")
        else:
            await callback.message.edit_text("❌ Ошибка сброса серии")
        
        await state.clear()
        await callback.answer()
        return
    
    # Store action and ask for value
    await state.update_data(action=action)
    
    prompt_text = {
        "set": "📝 Введите новое значение серии (например: 10):",
        "add": "➕ Введите количество дней для добавления (например: 5):",
        "subtract": "➖ Введите количество дней для вычитания (например: 3):",
    }
    
    await callback.message.edit_text(
        f"👤 Пользователь: {user_id}\n"
        f"🔥 Текущая серия: {current_streak} дней\n\n"
        f"{prompt_text.get(action, 'Введите значение:')}",
        parse_mode="HTML"
    )
    await state.set_state(StreakManagementState.waiting_for_value)
    await callback.answer()


@router.message(StreakManagementState.waiting_for_value)
async def streak_manage_set_value(message: types.Message, state: FSMContext):
    """Set the streak value"""
    try:
        value = int(message.text.strip())
        data = await state.get_data()
        user_id = data['user_id']
        action = data['action']
        current_streak = data['current_streak']
        
        success = False
        new_value = 0
        
        if action == "set":
            if value < 0:
                await message.answer("❌ Значение не может быть отрицательным")
                return
            success = streak_service.set_streak_manually(user_id, value)
            new_value = value
            
        elif action == "add":
            if value <= 0:
                await message.answer("❌ Значение должно быть положительным")
                return
            success = streak_service.adjust_streak(user_id, value)
            new_value = current_streak + value
            
        elif action == "subtract":
            if value <= 0:
                await message.answer("❌ Значение должно быть положительным")
                return
            success = streak_service.adjust_streak(user_id, -value)
            new_value = max(0, current_streak - value)
        
        if success:
            action_text = {
                "set": "установлена",
                "add": f"увеличена на {value}",
                "subtract": f"уменьшена на {value}"
            }
            
            await message.answer(
                f"✅ <b>Серия {action_text[action]}</b>\n\n"
                f"Пользователь: {user_id}\n"
                f"Было: {current_streak} дней\n"
                f"Стало: {new_value} дней",
                parse_mode="HTML"
            )
            logger.info(f"Admin {message.from_user.id} changed streak for user {user_id}: {current_streak} -> {new_value}")
        else:
            await message.answer("❌ Ошибка изменения серии")
        
        await state.clear()
        
    except ValueError:
        await message.answer("❌ Введите корректное число")
    except Exception as e:
        logger.error(f"Error in streak_manage_set_value: {e}")
        await message.answer("❌ Произошла ошибка")
        await state.clear()



# ========== USER LOOKUP ==========

@router.message(Command("users"))
async def list_active_users(message: types.Message):
    """List all active users with their IDs, names and usernames"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    all_users = list(session_service.user_chats.keys())
    
    if not all_users:
        await message.answer("📭 Нет активных пользователей")
        return
    
    # Collect user data
    users_data = []
    for user_id in all_users:
        info = session_service.get_user_info(user_id)
        streak_info = streak_service.get_user_streak(user_id)
        recent_hw = homework_service.get_user_homework_history(user_id, days=1)
        
        status = "✅" if recent_hw and recent_hw[0].is_complete else "⏳" if recent_hw else "❌"
        
        users_data.append({
            "user_id": user_id,
            "status": status,
            "streak": streak_info['current_streak'],
            "username": info.get("username"),
            "first_name": info.get("first_name"),
            "last_name": info.get("last_name")
        })
    
    # Sort by streak (descending)
    users_data.sort(key=lambda x: x['streak'], reverse=True)
    
    text = f"👥 <b>Активные пользователи ({len(all_users)}):</b>\n\n"
    
    for user in users_data[:25]:  # Показываем первых 25
        # Format name
        name_parts = []
        if user['first_name']:
            name_parts.append(user['first_name'])
        if user['last_name']:
            name_parts.append(user['last_name'])
        
        display_name = " ".join(name_parts) if name_parts else "Без имени"
        
        # Format username
        username_str = f"@{user['username']}" if user['username'] else ""
        
        # Build line
        text += (
            f"{user['status']} <b>{display_name}</b> {username_str}\n"
            f"   <code>{user['user_id']}</code> • 🔥 {user['streak']} дней\n\n"
        )
    
    if len(all_users) > 25:
        text += f"... и ещё {len(all_users) - 25} пользователей\n\n"
    
    text += (
        "💡 <b>Использование:</b>\n"
        "Скопируйте <code>user_id</code> и используйте:\n"
        "/streak_set [user_id] [значение]\n"
        "/user_hw [user_id]"
    )
    
    await message.answer(text, parse_mode="HTML")


@router.message(Command("find_user"))
async def find_user_by_streak(message: types.Message):
    """Find users by streak range"""
    if not is_admin(message.from_user.id):
        await message.answer("❌ У вас нет доступа")
        return
    
    try:
        parts = message.text.split()
        if len(parts) < 2:
            await message.answer(
                "📝 <b>Использование:</b>\n"
                "/find_user [мин_серия] - найти пользователей с серией >= значения\n\n"
                "<b>Примеры:</b>\n"
                "/find_user 10 - пользователи с серией от 10 дней\n"
                "/find_user 0 - все пользователи",
                parse_mode="HTML"
            )
            return
        
        min_streak = int(parts[1])
        all_users = list(session_service.user_chats.keys())
        
        # Filter by streak
        filtered_users = []
        for user_id in all_users:
            streak_info = streak_service.get_user_streak(user_id)
            if streak_info['current_streak'] >= min_streak:
                info = session_service.get_user_info(user_id)
                filtered_users.append({
                    "user_id": user_id,
                    "streak": streak_info['current_streak'],
                    "username": info.get("username"),
                    "first_name": info.get("first_name"),
                    "last_name": info.get("last_name")
                })
        
        # Sort by streak
        filtered_users.sort(key=lambda x: x['streak'], reverse=True)
        
        if not filtered_users:
            await message.answer(f"📭 Не найдено пользователей с серией >= {min_streak}")
            return
        
        text = f"🔍 <b>Пользователи с серией >= {min_streak} дней:</b>\n\n"
        
        for user in filtered_users[:20]:
            # Format name
            name_parts = []
            if user['first_name']:
                name_parts.append(user['first_name'])
            if user['last_name']:
                name_parts.append(user['last_name'])
            
            display_name = " ".join(name_parts) if name_parts else "Без имени"
            username_str = f" @{user['username']}" if user['username'] else ""
            
            text += (
                f"<b>{display_name}</b>{username_str}\n"
                f"<code>{user['user_id']}</code> • 🔥 {user['streak']} дней\n\n"
            )
        
        if len(filtered_users) > 20:
            text += f"... и ещё {len(filtered_users) - 20} пользователей"
        
        await message.answer(text, parse_mode="HTML")
        
    except ValueError:
        await message.answer("❌ Введите корректное число")