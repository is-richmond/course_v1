"""API Service for communicating with Auth and Core APIs"""

import httpx
from typing import Optional
from src.config import settings
from src.utils.logger import get_logger
from src.models. user import UserResponse, PhotoResponse

logger = get_logger(__name__)

class APIService:
    """Service for API communication"""
    
    def __init__(self, base_url: str = settings. CORE_API_URL):
        self.core_base_url = base_url. rstrip("/")
        self.auth_base_url = "http://auth: 8000"
        self.timeout = httpx.Timeout(settings.API_TIMEOUT)
    
    @staticmethod
    def detect_mime_type(file_data: bytes, filename: str) -> str:
        """Detect MIME type from file magic bytes and filename"""
        
        magic_bytes = {
            b'\xff\xd8\xff': 'image/jpeg',
            b'\x89PNG':  'image/png',
            b'GIF87a': 'image/gif',
            b'GIF89a': 'image/gif',
            b'RIFF': 'image/webp',
        }
        
        for magic, mime in magic_bytes.items():
            if file_data.startswith(magic):
                logger.info(f"Detected MIME type from magic bytes: {mime}")
                return mime
        
        if file_data.startswith(b'RIFF') and b'WEBP' in file_data[: 20]:
            return 'image/webp'
        
        ext = filename.split('.')[-1].lower()
        mime_map = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png':  'image/png',
            'webp': 'image/webp',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
        }
        
        mime = mime_map.get(ext, 'image/jpeg')
        logger.info(f"Detected MIME type from extension . {ext}: {mime}")
        return mime
    
    async def check_user_by_phone(self, phone: str) -> Optional[UserResponse]:
        """Check if user exists by phone in Auth service"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self. auth_base_url}/v1/user/phone/{phone}",
                    headers={"Accept": "application/json"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info(f"✅ User found:  {phone}")
                    return UserResponse(**data)
                elif response.status_code == 404:
                    logger.warning(f"❌ User not found: {phone}")
                    return None
                else:
                    logger.error(f"Auth API error:  {response.status_code}")
                    return None
        except Exception as e:
            logger.error(f"Check user error: {e}")
            return None
    
    async def upload_photo(
        self,
        user_id: int,
        file_data: bytes,
        filename:  str
    ) -> Optional[PhotoResponse]: 
        """Upload photo to S3 via Core API"""
        try:
            mime_type = self.detect_mime_type(file_data, filename)
            
            logger.info(f"Uploading {filename} ({len(file_data)} bytes) as {mime_type}")
            
            files = {'file': (filename, file_data, mime_type)}
            data = {'user_id': user_id}
            
            async with httpx.AsyncClient(timeout=self. timeout) as client:
                response = await client.post(
                    f"{self.core_base_url}/v1/photos/upload",
                    files=files,
                    data=data,
                    headers={"Accept":  "application/json"}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"✅ Photo uploaded:  {user_id}")
                    
                    photo_data = result. get('media', {})
                    
                    if 'download_url' in result:
                        photo_data['download_url'] = result['download_url']
                    
                    try:
                        return PhotoResponse(**photo_data)
                    except Exception as e:
                        logger. error(f"Photo parsing error: {e}, data: {photo_data}")
                        return None
                else: 
                    logger.error(f"Upload error: {response.status_code} - {response.text}")
                    return None
        except Exception as e:
            logger.error(f"Upload error: {e}")
            return None
    
    async def get_user_photos(self, user_id: int) -> list[PhotoResponse]:
        """Get all user photos"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.core_base_url}/v1/photos/user/{user_id}",
                    headers={"Accept": "application/json"}
                )
                
                if response. status_code == 200:
                    data = response.json()
                    photos = []
                    for photo_data in data.get('media', []):
                        try:
                            photos.append(PhotoResponse(**photo_data))
                        except Exception as e:
                            logger.warning(f"Error parsing photo: {e}, data: {photo_data}")
                    return photos
                else:
                    return []
        except Exception as e: 
            logger.error(f"Get photos error: {e}")
            return []