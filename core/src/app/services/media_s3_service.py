# app/services/media_s3_service.py
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from botocore.config import Config
from core.src.app.repositories.media_s3_config import media_s3_settings
from typing import Optional, BinaryIO, Literal
import logging
import uuid
import mimetypes
import urllib3
from PIL import Image
import io

urllib3.disable_warnings()

logger = logging.getLogger(__name__)

class MediaS3Service:
    def __init__(self):
        self.config = Config(
            retries={'max_attempts': 3},
            max_pool_connections=50
        )
        
        self.client = boto3.client(
            's3',
            endpoint_url=media_s3_settings.S3_ENDPOINT,
            aws_access_key_id=media_s3_settings.S3_ACCESS_KEY,
            aws_secret_access_key=media_s3_settings.S3_SECRET_KEY,
            region_name=media_s3_settings.S3_REGION,
            config=self.config,
            verify=False,
            use_ssl=False
        )
        
        self.bucket = media_s3_settings.S3_MEDIA_BUCKET
        
    def validate_file(
        self, 
        file_size: int, 
        content_type: str, 
        filename: str,
        media_type: Literal['image', 'video']
    ) -> tuple[bool, str]:
        """
        Валидация файла по размеру и типу
        
        Returns:
            tuple[bool, str]: (is_valid, error_message)
        """
        if media_type == 'image': 
            # Проверка размера изображения
            if file_size > media_s3_settings.MAX_IMAGE_SIZE:
                return False, f"Размер изображения превышает {media_s3_settings.MAX_IMAGE_SIZE / (1024*1024)}MB"
            
            # Проверка типа изображения
            if content_type not in media_s3_settings.ALLOWED_IMAGE_TYPES:
                return False, f"Недопустимый тип изображения.  Разрешены: {', '.join(media_s3_settings.ALLOWED_IMAGE_TYPES)}"
            
            # Проверка расширения
            ext = filename.split('.')[-1].lower() if '.' in filename else ''
            if ext not in media_s3_settings.ALLOWED_IMAGE_EXTENSIONS:
                return False, f"Недопустимое расширение файла. Разрешены: {', '.join(media_s3_settings. ALLOWED_IMAGE_EXTENSIONS)}"
        
        elif media_type == 'video':
            # Проверка размера видео
            if file_size > media_s3_settings.MAX_VIDEO_SIZE:
                return False, f"Размер видео превышает {media_s3_settings.MAX_VIDEO_SIZE / (1024*1024)}MB"
            
            # Проверка типа видео
            if content_type not in media_s3_settings.ALLOWED_VIDEO_TYPES:
                return False, f"Недопустимый тип видео. Разрешены: {', '.join(media_s3_settings.ALLOWED_VIDEO_TYPES)}"
            
            # Проверка расширения
            ext = filename.split('.')[-1].lower() if '.' in filename else ''
            if ext not in media_s3_settings.ALLOWED_VIDEO_EXTENSIONS: 
                return False, f"Недопустимое расширение файла. Разрешены:  {', '.join(media_s3_settings.ALLOWED_VIDEO_EXTENSIONS)}"
        
        return True, ""
    
    def get_image_dimensions(self, file_obj: BinaryIO) -> tuple[int, int]:
        """
        Получить размеры изображения
        
        Returns:
            tuple[int, int]: (width, height)
        """
        try:
            current_pos = file_obj.tell()
            file_obj.seek(0)
            
            image = Image.open(file_obj)
            width, height = image.size
            
            file_obj.seek(current_pos)
            return width, height
        except Exception as e:
            logger.error(f"Error getting image dimensions: {e}")
            return 0, 0
    
    def upload_media(
        self, 
        file_obj: BinaryIO, 
        filename: str,
        media_type: Literal['image', 'video'],
        content_type: str = None,
        course_id: Optional[int] = None,
        lesson_id: Optional[int] = None,
        user_id: Optional[int] = None  # ← ДОБАВЬ ЭТО
    ) -> tuple[str, dict]:
        """
        Загружает медиа-файл в S3
        
        Args:
            file_obj:  Поток байтов файла
            filename:  Имя файла
            media_type: Тип медиа ('image' или 'video')
            content_type:  MIME-тип
            course_id: ID курса (опционально)
            lesson_id: ID урока (опционально)
            user_id: ID пользователя (опционально, для фото от бота)  # ← ДОБАВЬ ОПИСАНИЕ
            
        Returns:
            tuple[str, dict]: (s3_key, metadata)
        """
        try:
            # Определяем content_type
            if not content_type:
                content_type, _ = mimetypes.guess_type(filename)
                if not content_type: 
                    content_type = 'application/octet-stream'
            
            # Генерируем путь в S3
            file_extension = filename. split('.')[-1] if '.' in filename else ''
            unique_id = str(uuid.uuid4())
            
            # ← ОБНОВЛЕННАЯ ЛОГИКА: проверяем user_id в первую очередь
            if user_id:
                # Для фото от Telegram бота
                s3_key = f"user-photos/{user_id}/{media_type}s/{unique_id}.{file_extension}"
            elif course_id and lesson_id:
                s3_key = f"courses/{course_id}/lessons/{lesson_id}/{media_type}s/{unique_id}.{file_extension}"
            elif course_id:
                s3_key = f"courses/{course_id}/{media_type}s/{unique_id}.{file_extension}"
            else:
                s3_key = f"{media_type}s/{unique_id}.{file_extension}"
            
            # Метаданные
            metadata = {}
            
            # Для изображений получаем размеры
            if media_type == 'image': 
                width, height = self.get_image_dimensions(file_obj)
                metadata['width'] = width
                metadata['height'] = height
            
            # Загружаем в S3
            file_obj.seek(0)
            self.client.upload_fileobj(
                file_obj,
                self.bucket,
                s3_key,
                ExtraArgs={
                    'ContentType': content_type,
                    'Metadata': {
                        'media_type': media_type,
                        'course_id': str(course_id) if course_id else '',
                        'lesson_id':  str(lesson_id) if lesson_id else '',
                        'user_id': str(user_id) if user_id else '',
                    }
                }
            )
            
            logger.info(f"Media uploaded successfully to S3: {s3_key}")
            return s3_key, metadata
            
        except Exception as e:
            logger.error(f"Error uploading media to S3: {e}")
            raise Exception(f"Failed to upload media: {e}")
    
    def download_media(self, s3_key: str) -> bytes:
        """Скачивает медиа из S3"""
        try:
            response = self.client.get_object(Bucket=self.bucket, Key=s3_key)
            return response['Body'].read()
        except ClientError as e: 
            if e.response['Error']['Code'] == 'NoSuchKey':
                raise Exception("Media not found in S3")
            logger.error(f"Error downloading media from S3: {e}")
            raise Exception(f"Failed to download media: {e}")
    
    def delete_media(self, s3_key: str) -> bool:
        """Удаляет медиа из S3"""
        try: 
            self.client.delete_object(Bucket=self.bucket, Key=s3_key)
            logger.info(f"Media deleted successfully from S3: {s3_key}")
            return True
        except Exception as e: 
            logger.error(f"Error deleting media from S3: {e}")
            raise Exception(f"Failed to delete media: {e}")
    
    def generate_presigned_url(self, s3_key: str, expires_in: int = 86400) -> str:
        """Генерирует временную ссылку"""
        try:
            url = self. client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket, 'Key':  s3_key},
                ExpiresIn=expires_in
            )
            return url
        except Exception as e:
            logger.error(f"Error generating presigned URL: {e}")
            raise Exception(f"Failed to generate URL: {e}")
    
    def check_connection(self) -> bool:
        """Проверяет подключение к S3"""
        try:
            self.client.head_bucket(Bucket=self.bucket)
            logger.info(f"S3 connection successful for bucket: {self.bucket}")
            return True
        except Exception as e:
            logger.error(f"S3 connection failed:  {e}")
            return False

# Создаем экземпляр сервиса
media_s3_service = MediaS3Service()