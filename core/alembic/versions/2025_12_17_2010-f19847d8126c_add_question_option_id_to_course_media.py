"""Add question_option_id to course_media

Revision ID: f19847d8126c
Revises: b8116e7108f6
Create Date: 2025-12-17 20:10:37.899627+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f19847d8126c'
down_revision: Union[str, Sequence[str], None] = 'b8116e7108f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Добавляем только поле question_option_id в существующую таблицу course_media
    op.add_column('course_media', 
        sa.Column('question_option_id', sa.Integer(), nullable=True)
    )
    
    # Создаем индекс
    op.create_index(
        'ix_course_media_question_option_id', 
        'course_media', 
        ['question_option_id'], 
        unique=False
    )
    
    # Создаем внешний ключ
    op.create_foreign_key(
        'fk_course_media_question_option_id',
        'course_media', 
        'question_options',
        ['question_option_id'], 
        ['id'],
        ondelete='CASCADE'
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Удаляем внешний ключ
    op.drop_constraint(
        'fk_course_media_question_option_id', 
        'course_media', 
        type_='foreignkey'
    )
    
    # Удаляем индекс
    op.drop_index(
        'ix_course_media_question_option_id', 
        table_name='course_media'
    )
    
    # Удаляем поле
    op.drop_column('course_media', 'question_option_id')