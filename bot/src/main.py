"""Main entry point for Telegram Bot"""

import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.client. default import DefaultBotProperties
from aiogram.enums import ParseMode
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import settings
from src.utils.logger import get_logger
from src.handlers import start, photo, commands, admin, errors

logger = get_logger(__name__)

logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logging.getLogger('aiogram').setLevel(logging.INFO)
logging.getLogger('httpx').setLevel(logging.WARNING)
logging.getLogger('asyncio').setLevel(logging.WARNING)


async def main():
    """Main bot function"""
    try:
        logger.info("🤖 Starting Telegram Bot...")
        logger.info(f"Bot token: {settings.BOT_TOKEN[: 10]}***")
        logger.info(f"Core API: {settings.CORE_API_URL}")
        logger.info(f"S3 Bucket: {settings.S3_BUCKET}")
        
        bot = Bot(
            token=settings.BOT_TOKEN,
            default=DefaultBotProperties(parse_mode=ParseMode.HTML)
        )
        
        storage = MemoryStorage()
        dp = Dispatcher(storage=storage)
        
        # Регистрируем роутеры
        dp.include_router(start.router)
        dp.include_router(commands.router)
        dp.include_router(admin.router)
        dp.include_router(photo.router)
        dp.include_router(errors.router)
        
        logger.info("✅ Bot started successfully!")
        logger.info("🚀 Listening for messages...")
        
        await dp.start_polling(
            bot,
            allowed_updates=dp.resolve_used_update_types()
        )
        
    except Exception as e:
        logger. error(f"❌ Failed to start bot: {e}")
        sys.exit(1)
    finally:
        await bot.session.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("🛑 Bot stopped")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)