"""Homework upload handler with streak tracking"""

from aiogram import Router, F, types
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, Message
import io
import uuid
from src.services.homework_service import homework_service
from src.services.service_streak import streak_service
from src.services.homework_schedule_service import homework_schedule_service
from src.services.api_service import APIService
from src.utils.logger import get_logger

logger = get_logger(__name__)
router = Router()
api_service = APIService()

# Default schedule ID
DEFAULT_SCHEDULE_ID = 1  # ПН-ЧТ

class HomeworkStates(StatesGroup):
    waiting_for_anki = State()
    waiting_for_test = State()
    waiting_for_lesson = State()

@router.callback_query(F.data == "upload_homework")
async def show_homework_menu(callback: types.CallbackQuery, state: FSMContext):
    """Show homework menu"""
    data = await state.get_data()
    user_id = data.get("user_id")
    
    if not user_id:
        await callback.answer("❌ Авторизуйтесь:  /start", show_alert=True)
        return
    
    status = homework_service.get_today_status(user_id)
    
    anki_icon = "✅" if status['anki_submitted'] else "⏳"
    test_icon = "✅" if status['test_submitted'] else "⏳"
    lesson_icon = "✅" if status['lesson_submitted'] else "⏳"
    
    text = (
        f"📸 <b>Загрузка ДЗ</b>\n\n"
        f"<b>Статус:</b>\n"
        f"{anki_icon} Anki\n"
        f"{test_icon} Тест\n"
        f"{lesson_icon} Урок\n\n"
    )
    
    if status['is_complete']:
        text += "🎉 Все выполнено!"
    else:
        text += "Выберите тип:"
    
    keyboard_buttons = []
    
    if not status['anki_submitted']:
        keyboard_buttons.append([InlineKeyboardButton(
            text="📝 Anki", callback_data="hw_upload_anki"
        )])
    if not status['test_submitted']: 
        keyboard_buttons.append([InlineKeyboardButton(
            text="📋 Тест", callback_data="hw_upload_test"
        )])
    if not status['lesson_submitted']:
        keyboard_buttons.append([InlineKeyboardButton(
            text="🎓 Урок", callback_data="hw_upload_lesson"
        )])
    
    keyboard_buttons.append([InlineKeyboardButton(
        text="◀️ Назад", callback_data="back_to_menu"
    )])
    
    await callback.message.edit_text(
        text,
        reply_markup=InlineKeyboardMarkup(inline_keyboard=keyboard_buttons),
        parse_mode="HTML"
    )
    await callback.answer()

@router.callback_query(F.data == "hw_upload_anki")
async def upload_anki(callback: types. CallbackQuery, state: FSMContext):
    """Start Anki upload"""
    await callback.message.edit_text(
        "📝 <b>Anki карточки</b>\n\n"
        "Отправьте скриншот статистики Anki.",
        parse_mode="HTML"
    )
    await state.set_state(HomeworkStates.waiting_for_anki)
    await callback.answer()

@router.callback_query(F.data == "hw_upload_test")
async def upload_test(callback: types.CallbackQuery, state: FSMContext):
    """Start test upload"""
    await callback.message.edit_text(
        "📋 <b>Тест</b>\n\n"
        "Отправьте скриншот выполненного теста.",
        parse_mode="HTML"
    )
    await state.set_state(HomeworkStates.waiting_for_test)
    await callback.answer()

@router.callback_query(F.data == "hw_upload_lesson")
async def upload_lesson(callback:  types.CallbackQuery, state: FSMContext):
    """Start lesson upload"""
    await callback. message.edit_text(
        "🎓 <b>Урок</b>\n\n"
        "Отправьте скриншот пройденного урока.",
        parse_mode="HTML"
    )
    await state.set_state(HomeworkStates.waiting_for_lesson)
    await callback.answer()

# ========== PHOTO HANDLERS ==========

@router.message(HomeworkStates.waiting_for_anki, F.photo)
async def handle_anki_photo(message:  Message, state: FSMContext):
    await process_homework_photo(message, state, "anki", "Anki")

@router.message(HomeworkStates.waiting_for_test, F.photo)
async def handle_test_photo(message: Message, state: FSMContext):
    await process_homework_photo(message, state, "test", "теста")

@router.message(HomeworkStates.waiting_for_lesson, F.photo)
async def handle_lesson_photo(message: Message, state: FSMContext):
    await process_homework_photo(message, state, "lesson", "урока")

async def process_homework_photo(
    message: Message,
    state: FSMContext,
    hw_type: str,
    type_name: str
):
    """Process homework photo"""
    data = await state.get_data()
    user_id = data. get("user_id")
    
    if not user_id: 
        await message.answer("❌ Авторизуйтесь: /start")
        return
    
    status_msg = await message.answer("⏳ Загружаю...")
    
    try:
        # Download photo
        photo = message.photo[-1]
        file = await message.bot.get_file(photo.file_id)
        
        file_bytes = io.BytesIO()
        await message.bot.download_file(file.file_path, file_bytes)
        file_bytes = file_bytes.getvalue()
        
        filename = f"{hw_type}_{uuid.uuid4()}.jpg"
        
        # Upload to S3
        photo_response = await api_service.upload_photo(
            user_id=user_id,
            file_data=file_bytes,
            filename=filename
        )
        
        if not photo_response:
            await status_msg.edit_text("❌ Ошибка загрузки")
            return
        
        # Save to DB
        result = homework_service.submit_homework(
            user_id=user_id,
            homework_type=hw_type,
            photo_url=photo_response. download_url
        )
        
        if not result['success']:
            await status_msg. edit_text("❌ Ошибка сохранения")
            return
        
        await status_msg. delete()
        
        # Check if complete
        if result['is_complete']:
            # ✅ UPDATE STREAK
            streak_result = streak_service.update_streak(
                user_id=user_id,
                schedule_id=DEFAULT_SCHEDULE_ID
            )
            
            response = f"✅ <b>ДЗ принято! </b>\n\n"
            
            if streak_result['updated']: 
                response += (
                    f"🔥 <b>Стрик:  {streak_result['current_streak']} дней! </b>\n"
                    f"🏆 Рекорд: {streak_result['longest_streak']} дней\n\n"
                )
                
                if streak_result. get('congratulation'):
                    response += f"🎉 {streak_result['congratulation']}"
            else:
                response += f"💡 {streak_result. get('message', 'Статус: неизвестно')}"
            
            await message.answer(response, parse_mode="HTML")
        else:
            # Show remaining
            remaining = []
            if not result['anki_submitted']: 
                remaining.append("📝 Anki")
            if not result['test_submitted']:
                remaining.append("📋 Тест")
            if not result['lesson_submitted']:
                remaining.append("🎓 Урок")
            
            await message.answer(
                f"✅ {type_name} загружено!\n\n"
                f"<b>Осталось:</b>\n" + "\n".join(remaining),
                parse_mode="HTML"
            )
        
        # Save user_id and clear state
        await state.clear()
        await state.update_data(user_id=user_id)
        
        # Show menu button
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="📸 Еще", callback_data="upload_homework")],
            [InlineKeyboardButton(text="◀️ Меню", callback_data="back_to_menu")]
        ])
        
        await message.answer("Что дальше?", reply_markup=keyboard)
        
        logger.info(f"✅ Homework uploaded: user={user_id}, type={hw_type}")
        
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        try:
            await status_msg. edit_text("❌ Ошибка загрузки")
        except:
            await message.answer("❌ Ошибка")

# ========== PROGRESS ==========

@router.callback_query(F.data == "my_progress")
async def show_progress(callback: types.CallbackQuery, state: FSMContext):
    """Show progress"""
    data = await state.get_data()
    user_id = data.get("user_id")
    
    if not user_id:
        await callback. answer("❌ Авторизуйтесь", show_alert=True)
        return
    
    today_status = homework_service.get_today_status(user_id)
    streak_info = streak_service.get_user_streak(user_id, DEFAULT_SCHEDULE_ID)
    history = homework_service.get_user_homework_history(user_id, days=7)
    
    completed = sum(1 for h in history if h. is_complete)
    
    anki_icon = "✅" if today_status['anki_submitted'] else "⏳"
    test_icon = "✅" if today_status['test_submitted'] else "⏳"
    lesson_icon = "✅" if today_status['lesson_submitted'] else "⏳"
    
    text = (
        f"📊 <b>Прогресс</b>\n\n"
        f"<b>Сегодня: </b>\n"
        f"{anki_icon} Anki\n"
        f"{test_icon} Тест\n"
        f"{lesson_icon} Урок\n\n"
        f"🔥 Стрик: {streak_info['current_streak']} дней\n"
        f"🏆 Рекорд:  {streak_info['longest_streak']} дней\n\n"
        f"📈 За 7 дней: {completed}/{len(history)} дней\n\n"
        f"💪 Продолжай!"
    )
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🛡️ Гарантия", callback_data="check_guarantee")],
        [InlineKeyboardButton(text="◀️ Назад", callback_data="back_to_menu")]
    ])
    
    await callback.message. edit_text(text, reply_markup=keyboard, parse_mode="HTML")
    await callback.answer()