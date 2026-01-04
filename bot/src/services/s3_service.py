"""S3 Service for file uploads"""

import boto3
import uuid
from src.config import settings
from src.utils.logger import get_logger

logger = get_logger(__name__)

class S3Service:
    """Service for S3 operations"""
    
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.S3_REGION
        )
        self.bucket = settings.S3_BUCKET
    
    async def upload_photo(
        self, 
        file_data: bytes, 
        user_id: int,
        filename: str
    ) -> dict:
        """Upload photo to S3"""
        try:
            # Generate unique filename
            file_extension = filename.split('.')[-1]
            unique_filename = f"user_photos/{user_id}/{uuid.uuid4()}.{file_extension}"
            
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket,
                Key=unique_filename,
                Body=file_data,
                ContentType='image/jpeg'
            )
            
            # Generate URL
            url = f"{settings.S3_ENDPOINT}/{self.bucket}/{unique_filename}"
            
            logger.info(f"✅ File uploaded to S3: {unique_filename}")
            
            return {
                "success": True,
                "s3_key": unique_filename,
                "url": url,
                "bucket": self.bucket
            }
        except Exception as e:
            logger.error(f"S3 upload error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_photo_url(self, s3_key: str) -> str:
        """Get signed URL for photo"""
        try: 
            url = f"{settings.S3_ENDPOINT}/{self.bucket}/{s3_key}"
            return url
        except Exception as e:
            logger.error(f"Get URL error: {e}")
            return ""
    
    async def delete_photo(self, s3_key: str) -> bool:
        """Delete photo from S3"""
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket,
                Key=s3_key
            )
            logger.info(f"✅ File deleted from S3: {s3_key}")
            return True
        except Exception as e:
            logger.error(f"Delete error: {e}")
            return False