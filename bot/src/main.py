"""Main entry point for Telegram Bot with Scheduler"""
import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.types import BotCommand, BotCommandScopeDefault, BotCommandScopeChat
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import settings
from src.utils.logger import get_logger
from src.handlers import (
    start,
    homework,
    guarantee,
    admin_reminders,
    admin_homework,
    commands,
    errors,
    admin_schedule,
)
from src.services.scheduler_service import init_scheduler

logger = get_logger(__name__)

logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logging.getLogger('aiogram').setLevel(logging.INFO)
logging.getLogger('httpx').setLevel(logging.WARNING)
logging.getLogger('asyncio').setLevel(logging.WARNING)

# 🔧 СПИСОК АДМИНОВ (добавьте в config.py или здесь)
ADMIN_IDS = [
    894877615, 631950456,  # Ваш ID
    # Добавьте ID других админов здесь
]


async def setup_bot_commands(bot: Bot):
    """Настройка команд для обычных пользователей"""
    
    user_commands = [
        BotCommand(command="start", description="Запустить бота"),
        # BotCommand(command="menu", description="📋 Главное меню"),
        # BotCommand(command="homework", description="📸 Загрузить домашку"),
        # BotCommand(command="progress", description="📊 Мой прогресс"),
        # BotCommand(command="help", description="❓ Помощь"),
    ]
    
    # Устанавливаем для всех пользователей по умолчанию
    await bot.set_my_commands(
        commands=user_commands,
        scope=BotCommandScopeDefault()
    )
    
    logger.info("✅ User commands configured")


async def setup_admin_commands(bot: Bot):
    """Настройка команд для админов"""
    
    admin_commands = [
        # Обычные команды
        BotCommand(command="start", description="Запустить бота"),
        # BotCommand(command="menu", description="📋 Главное меню"),
        # BotCommand(command="homework", description="📸 Загрузить домашку"),
        # BotCommand(command="progress", description="📊 Мой прогресс"),
        # BotCommand(command="help", description="❓ Помощь"),
        # Админские команды
        # BotCommand(command="admin", description="Админ-панель"),
        BotCommand(command="admin_reminders", description="Рассылка"),
        BotCommand(command="create_reminder_type", description="Создать тип напоминания"),
        BotCommand(command="list_reminder_types", description="Список типов напоминаний"),
        BotCommand(command="add_message", description="Добавить сообщение в пулл"),
        BotCommand(command="list_messages", description="Список сообщений"),
        BotCommand(command="delete_message", description="Удалить сообщение"),
        BotCommand(command="delete_reminder_type", description="Удалить тип напоминания"),
        BotCommand(command="create_streak_msg", description="Создать поздравление за стрик"),
        BotCommand(command="list_streak_msgs", description="Список поздравлений"),
        BotCommand(command="delete_streak_msg", description="Удалить поздравление"),
        BotCommand(command="admin_hw", description="Управление домашними заданиями"),
        BotCommand(command="hw_stats", description="Статистика ДЗ"),
        BotCommand(command="guarantee_set", description="Управление гарантией"),
    ]
    
    # Устанавливаем для каждого админа отдельно
    for admin_id in ADMIN_IDS:
        await bot.set_my_commands(
            commands=admin_commands,
            scope=BotCommandScopeChat(chat_id=admin_id)
        )
        logger.info(f"✅ Admin commands configured for user {admin_id}")


async def main():
    """Main bot function"""
    try:
        logger.info("🤖 Starting Telegram Bot...")
        logger.info(f"Bot token: {settings.BOT_TOKEN[:10]}***")
        logger.info(f"Core API: {settings.CORE_API_URL}")
        logger.info(f"S3 Bucket: {settings.S3_BUCKET}")
        logger.info(f"Database: {settings.DATABASE_URL.split('@')[0]}***")
        
        bot = Bot(
            token=settings.BOT_TOKEN,
            default=DefaultBotProperties(parse_mode=ParseMode.HTML)
        )
        
        storage = MemoryStorage()
        dp = Dispatcher(storage=storage)
        
        # Register routers
        logger.info("📋 Registering routers...")
        dp.include_router(start.router)
        dp.include_router(homework.router)
        dp.include_router(guarantee.router)
        dp.include_router(commands.router)
        dp.include_router(admin_schedule.router)
        dp.include_router(admin_reminders.router)
        dp.include_router(admin_homework.router)
        dp.include_router(errors.router)
        logger.info("✅ All routers registered")
        
        # 🔧 НАСТРОЙКА КОМАНД
        logger.info("⚙️ Setting up bot commands...")
        await setup_bot_commands(bot)
        await setup_admin_commands(bot)
        logger.info("✅ Bot commands configured")
        
        # Initialize scheduler
        logger.info("⏰ Initializing scheduler...")
        scheduler = init_scheduler(bot)
        
        # Start scheduler in background
        scheduler_task = asyncio.create_task(scheduler.start())
        logger.info("✅ Scheduler started in background")
        
        logger.info("✅ Bot started successfully!")
        logger.info("🚀 Listening for messages...")
        
        try:
            await dp.start_polling(
                bot,
                allowed_updates=dp.resolve_used_update_types()
            )
        finally:
            # Stop scheduler on exit
            scheduler.stop()
            await scheduler_task
            
    except Exception as e:
        logger.error(f"❌ Failed to start bot: {e}")
        sys.exit(1)
    finally:
        await bot.session.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("🛑 Bot stopped by user")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)