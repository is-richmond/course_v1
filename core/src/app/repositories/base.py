"""Base repository with common database operations."""

import logging
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.src.app.db.database import Base

logger = logging.getLogger(__name__)

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Base repository for database operations."""
    
    def __init__(self, model: Type[ModelType], session: AsyncSession):
        """
        Initialize repository.
        
        Args:
            model: SQLAlchemy model class
            session: Async database session
        """
        self.model = model
        self.session = session
    
    async def get(self, id_: Union[UUID, int]) -> Optional[ModelType]:
        """
        Get entity by ID.
        
        Args:
            id_: Entity ID (UUID or int)
            
        Returns:
            Optional[ModelType]: Entity or None if not found
        """
        result = await self.session.execute(
            select(self.model).where(self.model.id == id_)
        )
        return result.scalars().first()
    
    async def list(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> List[ModelType]:
        """
        Get list of entities.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List[ModelType]: List of entities
        """
        result = await self.session.execute(
            select(self.model).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def create(self, **kwargs: Any) -> ModelType:
        """
        Create new entity.
        
        Args:
            **kwargs: Entity attributes
            
        Returns:
            ModelType: Created entity
        """
        instance = self.model(**kwargs)
        self.session.add(instance)
        await self.session.commit()
        await self.session.refresh(instance)
        
        logger.info(f"Created {self.model.__name__} with ID: {instance.id}")
        
        return instance
    
    async def update(self, id_: Union[UUID, int], **kwargs: Any) -> Optional[ModelType]:
        """
        Update entity.
        
        Args:
            id_: Entity ID (UUID or int)
            **kwargs: Attributes to update
            
        Returns:
            Optional[ModelType]: Updated entity or None if not found
        """
        instance = await self.get(id_)
        
        if not instance:
            return None
        
        for key, value in kwargs.items():
            if hasattr(instance, key):
                setattr(instance, key, value)
        
        await self.session.commit()
        await self.session.refresh(instance)
        
        logger.info(f"Updated {self.model.__name__} with ID: {id_}")
        
        return instance
    
    async def delete(self, id_: Union[UUID, int]) -> bool:
        """
        Delete entity.
        
        Args:
            id_: Entity ID (UUID or int)
            
        Returns:
            bool: True if deleted, False if not found
        """
        instance = await self.get(id_)
        
        if not instance:
            return False
        
        await self.session.delete(instance)
        await self.session.commit()
        
        logger.info(f"Deleted {self.model.__name__} with ID: {id_}")
        
        return True