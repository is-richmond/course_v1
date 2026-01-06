"""Homework upload handler"""

from aiogram import Router, F, types
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, Message
import io
import uuid
from src.services.homework_service import homework_service
from src.services.service_streak import streak_service
from src.services.api_service import APIService
from src.utils.logger import get_logger

logger = get_logger(__name__)
router = Router()
api_service = APIService()

class HomeworkStates(StatesGroup):
    waiting_for_anki = State()
    waiting_for_test = State()
    waiting_for_lesson = State()

@router.callback_query(F.data == "upload_homework")
async def show_homework_menu(callback: types.CallbackQuery, state: FSMContext):
    """Show homework upload menu with current status"""
    data = await state.get_data()
    user_id = data.get("user_id")
    
    if not user_id:
        await callback.answer("❌ Сначала авторизуйтесь через /start", show_alert=True)
        return
    
    # Get today's status
    status = homework_service.get_today_status(user_id)
    
    # Create status text
    anki_status = "✅" if status['anki_submitted'] else "⏳"
    test_status = "✅" if status['test_submitted'] else "⏳"
    lesson_status = "✅" if status['lesson_submitted'] else "⏳"
    
    text = (
        f"📸 <b>Загрузка домашнего задания</b>\n\n"
        f"<b>Сегодняшний статус:</b>\n"
        f"{anki_status} Anki карточки\n"
        f"{test_status} Тест\n"
        f"{lesson_status} Урок\n\n"
    )
    
    if status['is_complete']:
        text += "🎉 <b>Отлично! Все задания выполнены!</b>"
    else:
        text += "💡 Выберите тип задания для загрузки:"
    
    # Create keyboard
    keyboard_buttons = []
    
    if not status['anki_submitted']:
        keyboard_buttons.append([InlineKeyboardButton(
            text="📝 Загрузить Anki",
            callback_data="hw_upload_anki"
        )])
    
    if not status['test_submitted']:
        keyboard_buttons.append([InlineKeyboardButton(
            text="📋 Загрузить тест",
            callback_data="hw_upload_test"
        )])
    
    if not status['lesson_submitted']:
        keyboard_buttons.append([InlineKeyboardButton(
            text="🎓 Загрузить урок",
            callback_data="hw_upload_lesson"
        )])
    
    keyboard_buttons.append([InlineKeyboardButton(
        text="◀️ Назад в меню",
        callback_data="back_to_menu"
    )])
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=keyboard_buttons)
    
    await callback.message.edit_text(
        text,
        reply_markup=keyboard,
        parse_mode="HTML"
    )
    await callback.answer()

@router.callback_query(F.data == "hw_upload_anki")
async def upload_anki(callback: types.CallbackQuery, state: FSMContext):
    """Start Anki upload"""
    await callback.message.edit_text(
        "📝 <b>Загрузка Anki карточек</b>\n\n"
        "Отправьте скриншот вашей статистики Anki.\n"
        "Должно быть видно количество повторенных карточек.",
        parse_mode="HTML"
    )
    await state.set_state(HomeworkStates.waiting_for_anki)
    await callback.answer()

@router.callback_query(F.data == "hw_upload_test")
async def upload_test(callback: types.CallbackQuery, state: FSMContext):
    """Start test upload"""
    await callback.message.edit_text(
        "📋 <b>Загрузка теста</b>\n\n"
        "Отправьте скриншот выполненного теста.\n"
        "Должен быть виден результат.",
        parse_mode="HTML"
    )
    await state.set_state(HomeworkStates.waiting_for_test)
    await callback.answer()

@router.callback_query(F.data == "hw_upload_lesson")
async def upload_lesson(callback: types.CallbackQuery, state: FSMContext):
    """Start lesson upload"""
    await callback.message.edit_text(
        "🎓 <b>Загрузка урока</b>\n\n"
        "Отправьте скриншот пройденного урока.\n"
        "Должна быть видна дата и статус прохождения.",
        parse_mode="HTML"
    )
    await state.set_state(HomeworkStates.waiting_for_lesson)
    await callback.answer()

# ========== PHOTO HANDLERS ==========

@router.message(HomeworkStates.waiting_for_anki, F.photo)
async def handle_anki_photo(message: Message, state: FSMContext):
    """Handle Anki photo upload"""
    await process_homework_photo(message, state, "anki", "Anki карточек")

@router.message(HomeworkStates.waiting_for_test, F.photo)
async def handle_test_photo(message: Message, state: FSMContext):
    """Handle test photo upload"""
    await process_homework_photo(message, state, "test", "теста")

@router.message(HomeworkStates.waiting_for_lesson, F.photo)
async def handle_lesson_photo(message: Message, state: FSMContext):
    """Handle lesson photo upload"""
    await process_homework_photo(message, state, "lesson", "урока")

async def process_homework_photo(
    message: Message,
    state: FSMContext,
    homework_type: str,
    type_name: str
):
    """Process homework photo upload"""
    data = await state.get_data()
    user_id = data.get("user_id")
    
    if not user_id:
        await message.answer("❌ Сначала авторизуйтесь через /start")
        return
    
    status_msg = await message.answer("⏳ Загружаю...")
    
    try:
        # Download photo
        photo = message.photo[-1]
        file = await message.bot.get_file(photo.file_id)
        
        file_bytes = io.BytesIO()
        await message.bot.download_file(file.file_path, file_bytes)
        file_bytes = file_bytes.getvalue()
        
        # Generate filename
        filename = f"{homework_type}_{uuid.uuid4()}.jpg"
        
        # Upload to S3 via API
        photo_response = await api_service.upload_photo(
            user_id=user_id,
            file_data=file_bytes,
            filename=filename
        )
        
        if not photo_response:
            await status_msg.edit_text("❌ Ошибка загрузки. Попробуйте еще раз.")
            return
        
        # Save to homework database
        result = homework_service.submit_homework(
            user_id=user_id,
            homework_type=homework_type,
            photo_url=photo_response.download_url
        )
        
        if not result['success']:
            await status_msg.edit_text("❌ Ошибка сохранения. Попробуйте еще раз.")
            return
        
        await status_msg.delete()
        
        # Check if all completed
        if result['is_complete']:
            # Update streak
            streak_result = streak_service.update_streak(user_id)
            
            success_text = (
                f"✅ <b>Отлично! Скриншот {type_name} загружен!</b>\n\n"
                f"🎉 <b>Все задания на сегодня выполнены!</b>\n\n"
            )
            
            if streak_result['updated']:
                success_text += f"🔥 <b>Серия: {streak_result['current_streak']} дней!</b>\n"
                
                # Add congratulation if milestone
                if streak_result.get('congratulation'):
                    success_text += f"\n{streak_result['congratulation']}"
            
            await message.answer(success_text, parse_mode="HTML")
        else:
            # Show remaining tasks
            remaining = []
            if not result['anki_submitted']:
                remaining.append("📝 Anki")
            if not result['test_submitted']:
                remaining.append("📋 Тест")
            if not result['lesson_submitted']:
                remaining.append("🎓 Урок")
            
            await message.answer(
                f"✅ Скриншот {type_name} загружен!\n\n"
                f"<b>Осталось загрузить:</b>\n" +
                "\n".join(remaining),
                parse_mode="HTML"
            )
        
        # 🔧 ИСПРАВЛЕНИЕ: Сохраняем user_id перед очисткой состояния
        user_id_saved = data.get("user_id")
        
        # Clear only homework state
        await state.clear()
        
        # 🔧 ИСПРАВЛЕНИЕ: Восстанавливаем user_id после очистки
        await state.update_data(user_id=user_id_saved)
        
        # Show homework menu button
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="📸 Загрузить еще", callback_data="upload_homework")],
            [InlineKeyboardButton(text="◀️ Главное меню", callback_data="back_to_menu")]
        ])
        
        await message.answer(
            "Что дальше?",
            reply_markup=keyboard
        )
        
        logger.info(f"✅ Homework {homework_type} uploaded for user {user_id}")
        
    except Exception as e:
        logger.error(f"Error uploading homework: {e}", exc_info=True)
        try:
            await status_msg.edit_text(
                "❌ Произошла ошибка при загрузке.\n"
                "Попробуйте еще раз."
            )
        except:
            await message.answer("❌ Ошибка загрузки")

# ========== PROGRESS COMMAND ==========

@router.callback_query(F.data == "my_progress")
async def show_progress(callback: types.CallbackQuery, state: FSMContext):
    """Show user progress and stats"""
    data = await state.get_data()
    user_id = data.get("user_id")
    
    if not user_id:
        await callback.answer("❌ Сначала авторизуйтесь", show_alert=True)
        return
    
    # Get today's status
    today_status = homework_service.get_today_status(user_id)
    
    # Get streak info
    streak_info = streak_service.get_user_streak(user_id)
    
    # Get history
    history = homework_service.get_user_homework_history(user_id, days=7)
    
    completed_count = sum(1 for h in history if h.is_complete)
    
    anki_icon = "✅" if today_status['anki_submitted'] else "⏳"
    test_icon = "✅" if today_status['test_submitted'] else "⏳"
    lesson_icon = "✅" if today_status['lesson_submitted'] else "⏳"
    
    text = (
        f"📊 <b>Твой прогресс</b>\n\n"
        f"<b>Сегодня:</b>\n"
        f"{anki_icon} Anki\n"
        f"{test_icon} Тест\n"
        f"{lesson_icon} Урок\n\n"
        f"🔥 <b>Текущая серия:</b> {streak_info['current_streak']} дней\n"
        f"🏆 <b>Лучшая серия:</b> {streak_info['longest_streak']} дней\n\n"
        f"📈 <b>За последние 7 дней:</b>\n"
        f"Выполнено: {completed_count} из {len(history)} дней\n\n"
        f"💪 Продолжай в том же духе!"
    )
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🛡️ Проверить гарантию", callback_data="check_guarantee")],
        [InlineKeyboardButton(text="◀️ Назад", callback_data="back_to_menu")]
    ])
    
    await callback.message.edit_text(
        text,
        reply_markup=keyboard,
        parse_mode="HTML"
    )
    await callback.answer()