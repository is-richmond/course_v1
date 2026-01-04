"""User Service"""

from src.services.api_service import APIService
from src.models.user import UserResponse
from src.utils.logger import get_logger

logger = get_logger(__name__)

class UserService: 
    """Service for user operations"""
    
    def __init__(self, api_service: APIService):
        self.api_service = api_service
    
    async def get_or_create_user(
        self, 
        telegram_id: int, 
        username: str, 
        first_name: str
    ) -> dict:
        """Get existing user or create new one"""
        # Check if user exists
        user = await self.api_service.check_user_by_telegram_id(telegram_id)
        
        if user:
            return {
                "exists": True,
                "user_id": user.id,
                "user": user
            }
        
        # Create new user if doesn't exist
        logger.info(f"Creating new user for telegram_id: {telegram_id}")
        user = await self.api_service.register_telegram_user(
            telegram_id=telegram_id,
            username=username,
            first_name=first_name
        )
        
        if user:
            return {
                "exists": False,
                "user_id": user.id,
                "user": user
            }
        
        return {
            "exists": False,
            "user_id": None,
            "user": None,
            "error": "Failed to create user"
        }