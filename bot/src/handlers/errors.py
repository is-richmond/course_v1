"""Error handlers"""

from aiogram import Router
from aiogram.types import Update
from aiogram.filters import ExceptionTypeFilter
from aiogram.exceptions import TelegramBadRequest
from src.utils.logger import get_logger

logger = get_logger(__name__)

router = Router()

@router.error(ExceptionTypeFilter(TelegramBadRequest))
async def handle_telegram_bad_request(update: Update, exception: TelegramBadRequest):
    """Handle Telegram bad request errors"""
    logger.warning(f"TelegramBadRequest: {exception}")
    
    # Если сообщение не найдено для редактирования - просто логируем
    if "message to edit not found" in str(exception):
        logger.info(f"Message was deleted: {exception}")
        return
    
    logger. error(f"Telegram error:  {exception}")


@router.error()
async def handle_general_error(update: Update, exception: Exception):
    """Handle general exceptions"""
    logger.error(f"Unexpected error: {exception}", exc_info=True)
    
    # Пытаемся отправить сообщение об ошибке
    try: 
        if update.message:
            await update.message.answer(
                "❌ Произошла ошибка. Пожалуйста, попробуйте позже.\n\n"
                "Если проблема повторяется, свяжитесь с поддержкой."
            )
        elif update.callback_query:
            await update.callback_query.answer(
                "❌ Произошла ошибка",
                show_alert=True
            )
    except Exception as e:
        logger.error(f"Failed to send error message: {e}")