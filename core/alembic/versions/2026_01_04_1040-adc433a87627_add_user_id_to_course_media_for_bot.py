"""Add user_id to course_media for bot

Revision ID: adc433a87627
Revises: a1b2c3d4e5f6
Create Date: 2026-01-04 10:40:22.460386+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'adc433a87627'
down_revision:  Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - Add user_id column to course_media"""
    # Просто добавляем колонку user_id БЕЗ Foreign Key
    # (так как user хранится в Auth БД, а не в Core)
    op.add_column('course_media', 
        sa.Column('user_id', sa.Integer(), nullable=True)
    )
    
    # Создаем индекс для быстрого поиска
    op.create_index(
        op.f('ix_course_media_user_id'),
        'course_media',
        ['user_id'],
        unique=False
    )


def downgrade() -> None:
    """Downgrade schema - Remove user_id column from course_media"""
    # Удаляем индекс
    op.drop_index(op.f('ix_course_media_user_id'), table_name='course_media')
    
    # Удаляем колонку
    op.drop_column('course_media', 'user_id')