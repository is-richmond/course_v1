"""API Service for communicating with Core API"""

import httpx
from typing import Optional
from src.config import settings
from src.utils.logger import get_logger
from src.models.user import UserResponse, PhotoResponse

logger = get_logger(__name__)

class APIService:
    """Service for Core API communication"""
    
    def __init__(self, base_url: str = settings.CORE_API_URL):
        self.base_url = base_url. rstrip("/")
        self.timeout = httpx.Timeout(settings.API_TIMEOUT)
    
    async def check_user_by_telegram_id(self, telegram_id:  int) -> Optional[UserResponse]:
        """Check if user exists by telegram_id"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/v1/users/telegram/{telegram_id}",
                    headers={"Accept": "application/json"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info(f"✅ User found: {telegram_id}")
                    return UserResponse(**data)
                elif response.status_code == 404:
                    logger.warning(f"❌ User not found: {telegram_id}")
                    return None
                else:
                    logger.error(f"API error: {response.status_code} - {response.text}")
                    return None
        except httpx.TimeoutException:
            logger.error(f"Timeout checking user {telegram_id}")
            return None
        except httpx.RequestError as e:
            logger. error(f"Request error:  {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return None
    
    async def register_telegram_user(
        self, 
        telegram_id: int, 
        username: str, 
        first_name: str,
        email: Optional[str] = None
    ) -> Optional[UserResponse]:
        """Register or link Telegram account"""
        try:
            payload = {
                "telegram_id": telegram_id,
                "username": username,
                "first_name": first_name,
                "email": email or f"tg_{telegram_id}@telegram.local"
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client. post(
                    f"{self.base_url}/v1/users/telegram/register",
                    json=payload,
                    headers={"Accept": "application/json"}
                )
                
                if response. status_code == 201:
                    data = response. json()
                    logger.info(f"✅ User registered: {telegram_id}")
                    return UserResponse(**data)
                else:
                    logger.error(f"Registration error: {response.status_code} - {response.text}")
                    return None
        except Exception as e:
            logger.error(f"Registration error: {e}")
            return None
    
    async def upload_photo(
        self, 
        user_id: int, 
        file_data: bytes, 
        filename:  str
    ) -> Optional[PhotoResponse]:
        """Upload photo to S3 via API"""
        try:
            files = {'file': (filename, file_data, 'image/jpeg')}
            data = {'user_id': user_id}
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/v1/photos/upload",
                    files=files,
                    data=data,
                    headers={"Accept":  "application/json"}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"✅ Photo uploaded for user {user_id}")
                    return PhotoResponse(**result. get('photo', {}))
                else:
                    logger.error(f"Upload error: {response.status_code} - {response.text}")
                    return None
        except Exception as e: 
            logger.error(f"Photo upload error: {e}")
            return None
    
    async def get_user_photos(self, user_id: int) -> list[PhotoResponse]:
        """Get all user photos"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client. get(
                    f"{self.base_url}/v1/photos/user/{user_id}",
                    headers={"Accept": "application/json"}
                )
                
                if response. status_code == 200:
                    data = response.json()
                    return [PhotoResponse(**photo) for photo in data.get('photos', [])]
                else:
                    logger.error(f"Get photos error: {response.status_code}")
                    return []
        except Exception as e:
            logger. error(f"Get photos error:  {e}")
            return []