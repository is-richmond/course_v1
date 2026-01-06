"""Guarantee check handler"""

from aiogram import Router, F, types
from aiogram.fsm.context import FSMContext
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from src.services.guarantee_service import guarantee_service
from src.utils.logger import get_logger

logger = get_logger(__name__)
router = Router()

@router.callback_query(F.data == "check_guarantee")
async def check_guarantee(callback: types.CallbackQuery, state: FSMContext):
    """Check user guarantee status"""
    data = await state.get_data()
    user_id = data.get("user_id")
    
    if not user_id:
        await callback.answer("❌ Сначала авторизуйтесь", show_alert=True)
        return
    
    # Get guarantee info
    guarantee_info = guarantee_service.get_guarantee_info(user_id)
    
    if guarantee_info['has_guarantee']:
        text = (
            "✅ <b>Статус гарантии: АКТИВНА</b>\n\n"
            "🛡️ Ваша гарантия действует!\n\n"
            "<b>Чтобы сохранить гарантию:</b>\n"
            "• Выполняйте все 3 типа ДЗ каждый день\n"
            "• Не пропускайте дедлайны\n"
            "• Загружайте все до 00:00\n\n"
            "💪 Продолжайте в том же духе!"
        )
    else:
        text = (
            "❌ <b>Статус гарантии: НЕАКТИВНА</b>\n\n"
            "К сожалению, ваша гарантия была аннулирована.\n\n"
        )
        
        if guarantee_info['notes']:
            text += f"<b>Причина:</b>\n{guarantee_info['notes']}\n\n"
        
        text += (
            "📞 Для восстановления гарантии свяжитесь\n"
            "с администрацией курса."
        )
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="◀️ Назад к прогрессу", callback_data="my_progress")]
    ])
    
    await callback.message.edit_text(
        text,
        reply_markup=keyboard,
        parse_mode="HTML"
    )
    await callback.answer()