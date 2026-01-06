"""Scheduler service - sends automated reminders"""

import asyncio
from datetime import datetime, time as dt_time
from typing import List
from aiogram import Bot
from src.services.reminder_type_service import reminder_type_service
from src.services.homework_service import homework_service
from src.services.session_service import session_service
from src.services.service_streak import streak_service
from src.utils.logger import get_logger

logger = get_logger(__name__)

class SchedulerService:
    """Service for scheduling and sending automated reminders"""
    
    def __init__(self, bot: Bot):
        self.bot = bot
        self.is_running = False
    
    async def start(self):
        """Start the scheduler"""
        self.is_running = True
        logger.info("🚀 Scheduler started")
        
        while self.is_running:
            try:
                await self.check_and_send_reminders()
                await asyncio.sleep(60)  # Check every minute
            except Exception as e:
                logger.error(f"Scheduler error: {e}")
                await asyncio.sleep(60)
    
    def stop(self):
        """Stop the scheduler"""
        self.is_running = False
        logger.info("🛑 Scheduler stopped")
    
    async def check_and_send_reminders(self):
        """Check if any reminders should be sent now"""
        now = datetime.now()
        current_time = now.time()
        current_weekday = now.weekday() + 1  # Monday = 1, Sunday = 7
        
        # Get all active reminder types
        reminder_types = reminder_type_service.get_all_reminder_types()
        
        for reminder_type in reminder_types:
            # Check if time matches (within 1 minute)
            if not self._time_matches(current_time, reminder_type.time):
                continue
            
            # Check if today is in allowed days
            if reminder_type.days_of_week:
                allowed_days = [int(d) for d in reminder_type.days_of_week.split(',')]
                if current_weekday not in allowed_days:
                    continue
            
            # Send reminders for this type
            await self.send_reminder_type(reminder_type)
    
    def _time_matches(self, current_time: dt_time, target_time: dt_time) -> bool:
        """Check if current time matches target time (within 1 minute)"""
        return (
            current_time.hour == target_time.hour and
            current_time.minute == target_time.minute
        )
    
    async def send_reminder_type(self, reminder_type):
        """Send reminders of specific type to appropriate users"""
        logger.info(f"📨 Sending reminder type: {reminder_type.name}")
        
        # Get random message from pool
        message_data = reminder_type_service.get_random_message(reminder_type.id)
        
        if not message_data:
            logger.warning(f"No messages in pool for type {reminder_type.id}")
            return
        
        # Determine which users should receive this reminder
        target_users = self._get_target_users(reminder_type.name)
        
        # Get chat IDs for target users
        all_chat_ids = session_service.user_chats
        
        sent = 0
        failed = 0
        
        for user_id in target_users:
            chat_id = all_chat_ids.get(user_id)
            
            if not chat_id:
                continue
            
            try:
                # Personalize message if needed
                text = self._personalize_message(
                    message_data['message'],
                    user_id,
                    reminder_type.name
                )
                
                # Send message
                if message_data.get('image_url'):
                    await self.bot.send_photo(
                        chat_id=chat_id,
                        photo=message_data['image_url'],
                        caption=text,
                        parse_mode="HTML"
                    )
                else:
                    await self.bot.send_message(
                        chat_id=chat_id,
                        text=text,
                        parse_mode="HTML"
                    )
                
                sent += 1
                logger.info(f"✅ Sent {reminder_type.name} to user {user_id}")
                
            except Exception as e:
                failed += 1
                logger.error(f"Failed to send to user {user_id}: {e}")
        
        logger.info(f"📊 Reminder {reminder_type.name}: sent={sent}, failed={failed}")
    
    def _get_target_users(self, reminder_name: str) -> List[int]:
        """Determine which users should receive this reminder"""
        all_users = list(session_service.user_chats.keys())
        
        # Logic based on reminder name
        if "ДЗ на завтра" in reminder_name or "Homework Tomorrow" in reminder_name:
            # Send to all users
            return all_users
        
        elif "Первое напоминание" in reminder_name or "First Reminder" in reminder_name:
            # Send only to users who haven't completed homework today
            incomplete = homework_service.get_incomplete_users_today()
            return [uid for uid in incomplete if uid in all_users]
        
        elif "Последнее напоминание" in reminder_name or "Last Reminder" in reminder_name:
            # Send only to users who haven't completed homework today
            incomplete = homework_service.get_incomplete_users_today()
            return [uid for uid in incomplete if uid in all_users]
        
        elif "Невыполнение" in reminder_name or "Not Completed" in reminder_name:
            # Send only to users who didn't complete homework
            incomplete = homework_service.get_incomplete_users_today()
            return [uid for uid in incomplete if uid in all_users]
        
        elif "Поздравление" in reminder_name or "Congratulation" in reminder_name:
            # Send only to users who completed homework today
            completed = homework_service.get_completed_users_today()
            return [uid for uid in completed if uid in all_users]
        
        # Default: send to all
        return all_users
    
    def _personalize_message(self, message: str, user_id: int, reminder_name: str) -> str:
        """Personalize message with user-specific data"""
        # Add streak info if it's a 20:00 reminder
        if "Последнее" in reminder_name or "Last" in reminder_name:
            streak_info = streak_service.get_user_streak(user_id)
            current_streak = streak_info['current_streak']
            
            if current_streak > 0:
                message += f"\n\n⚠️ <b>Внимание!</b> Вы рискуете серией из <b>{current_streak} дней</b>!"
        
        return message

# Global instance will be created in main.py with bot instance
scheduler_service = None

def init_scheduler(bot: Bot) -> SchedulerService:
    """Initialize scheduler with bot instance"""
    global scheduler_service
    scheduler_service = SchedulerService(bot)
    return scheduler_service