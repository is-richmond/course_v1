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
from src. services.api_service import APIService
from src.utils.logger import get_logger

logger = get_logger(__name__)
router = Router()
api_service = APIService()


class HomeworkStates(StatesGroup):
    waiting_for_anki = State()
    waiting_for_test = State()
    waiting_for_lesson = State()


@router.callback_query(F.data == "upload_homework")
async def show_homework_menu(callback:  types.CallbackQuery, state: FSMContext):
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
        keyboard_buttons. append([InlineKeyboardButton(
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


@router.message(HomeworkStates.waiting_for_anki)
async def process_anki_photo(message: Message, state: FSMContext):
    """Process Anki photo"""
    await process_homework_submission(message, state, "anki")


@router.callback_query(F.data == "hw_upload_test")
async def upload_test(callback: types.CallbackQuery, state: FSMContext):
    """Start Test upload"""
    await callback.message.edit_text(
        "📋 <b>Тест</b>\n\n"
        "Отправьте скриншот результата теста.",
        parse_mode="HTML"
    )
    await state.set_state(HomeworkStates.waiting_for_test)
    await callback.answer()


@router.message(HomeworkStates.waiting_for_test)
async def process_test_photo(message: Message, state:  FSMContext):
    """Process Test photo"""
    await process_homework_submission(message, state, "test")


@router.callback_query(F.data == "hw_upload_lesson")
async def upload_lesson(callback: types.CallbackQuery, state: FSMContext):
    """Start Lesson upload"""
    await callback. message.edit_text(
        "🎓 <b>Урок</b>\n\n"
        "Отправьте скриншот конспекта урока.",
        parse_mode="HTML"
    )
    await state.set_state(HomeworkStates.waiting_for_lesson)
    await callback. answer()


@router.message(HomeworkStates.waiting_for_lesson)
async def process_lesson_photo(message: Message, state: FSMContext):
    """Process Lesson photo"""
    await process_homework_submission(message, state, "lesson")


async def process_homework_submission(message: Message, state: FSMContext, homework_type: str):
    """Process any homework submission"""
    if not message.photo:
        await message.answer("❌ Отправьте фото")
        return
    
    data = await state.get_data()
    user_id = data. get("user_id")
    
    try:
        # Get largest photo
        photo = message.photo[-1]
        file = await message.bot.get_file(photo.file_id)
        
        # Download photo
        photo_bytes = await message.bot.download_file(file.file_path)
        
        # Upload to S3
        file_name = f"{homework_type}_{uuid.uuid4()}.jpg"
        photo_url = await api_service.upload_photo(photo_bytes, file_name)
        
        if not photo_url:
            await message.answer("❌ Ошибка загрузки на сервер")
            return
        
        # Submit homework
        result = homework_service.submit_homework(user_id, homework_type, photo_url)
        
        if not result['success']:
            await message.answer(f"❌ Ошибка:  {result. get('error')}")
            return
        
        # ✅ ГЛАВНОЕ ИЗМЕНЕНИЕ: Обновляем стрик если ДЗ завершено! 
        if result. get('is_complete'):
            logger.info(f"📌 Homework complete for {user_id}, updating streak...")
            
            # Получаем активное расписание
            active_schedules = homework_schedule_service.get_all_schedules()
            if active_schedules:
                active_schedule_id = active_schedules[0].id
                
                # Обновляем стрик
                streak_result = streak_service.update_streak(user_id, active_schedule_id)
                
                if streak_result. get('updated'):
                    current_streak = streak_result. get('current_streak', 0)
                    congrats = streak_result.get('congratulation')
                    
                    await message.answer(
                        f"🔥 <b>Стрик обновлен!</b>\n\n"
                        f"Текущая серия: {current_streak} дней 📈",
                        parse_mode="HTML"
                    )
                    
                    # Если есть поздравление на этот день
                    if congrats: 
                        await message.answer(f"🎉 {congrats}", parse_mode="HTML")
            else:
                logger.warning("No active schedule found for streak update")
        
        # Show status
        status = homework_service. get_today_status(user_id)
        anki_icon = "✅" if status['anki_submitted'] else "⏳"
        test_icon = "✅" if status['test_submitted'] else "⏳"
        lesson_icon = "✅" if status['lesson_submitted'] else "⏳"
        
        text = (
            f"✅ <b>{homework_type. upper()} загружено!</b>\n\n"
            f"<b>Статус ДЗ:</b>\n"
            f"{anki_icon} Anki\n"
            f"{test_icon} Тест\n"
            f"{lesson_icon} Урок\n\n"
        )
        
        if status['is_complete']:
            text += "🎉 <b>ВСЕ ЗАДАНИЯ ВЫПОЛНЕНЫ!</b>"
        
        text += "\n\n📸 Загрузить еще?  /start"
        
        await message. answer(text, parse_mode="HTML")
        await state.clear()
        
    except Exception as e:
        logger.error(f"Error processing homework: {e}")
        await message.answer(f"❌ Ошибка: {str(e)}")