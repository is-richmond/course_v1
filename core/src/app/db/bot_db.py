"""Bot database connection."""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from core.src.app.core.config import settings

bot_engine = create_async_engine(
    settings.BOT_DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
)

bot_async_session_maker = async_sessionmaker(
    bot_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_bot_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Get async bot database session."""
    async with bot_async_session_maker() as session:
        yield session