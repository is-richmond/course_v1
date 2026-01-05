"""Middleware to send reminders to users"""

from typing import Callable, Dict, Any, Awaitable
from aiogram import BaseMiddleware
from aiogram.types import Message, TelegramObject
from src.services.reminder_service import reminder_service
from src.utils. logger import get_logger

logger = get_logger(__name__)

class ReminderMiddleware(BaseMiddleware):
    """Send active reminders when user sends message"""
    
    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any],
    ) -> Any:
        # Отправляем напоминания только для текстовых сообщений
        if isinstance(event, Message) and event.text:
            reminders = reminder_service.get_active_reminders()
            
            # Отправляем каждое напоминание пользователю
            for reminder in reminders:
                try:
                    reminder_text = (
                        f"📌 <b>{reminder.title}</b>\n\n"
                        f"{reminder.message}"
                    )
                    await event.answer(reminder_text, parse_mode="HTML")
                    logger. info(f"Sent reminder {reminder.id} to user {event.from_user.id}")
                except Exception as e: 
                    logger.error(f"Failed to send reminder: {e}")
        
        return await handler(event, data)