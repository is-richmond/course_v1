"""Error handlers"""

from aiogram import Router
from aiogram.types import Update
from src.utils.logger import get_logger

logger = get_logger(__name__)

router = Router()

async def error_handler(update: Update, exception: Exception):
    """Handle errors"""
    logger.error(f"Update: {update}\nException: {exception}")
    
    if update.message:
        try:
            await update.message.answer(
                "❌ Произошла ошибка. Пожалуйста, попробуйте позже.\n\n"
                "Если проблема повторяется, свяжитесь с поддержкой."
            )
        except Exception as e:
            logger.error(f"Failed to send error message: {e}")