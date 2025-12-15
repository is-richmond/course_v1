"""add course media table

Revision ID: d9f2f9ee5b49
Revises: ecface1a9028
Create Date: 2025-12-15 07:46:45.461203+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd9f2f9ee5b49'
down_revision: Union[str, Sequence[str], None] = 'ecface1a9028'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Изменение существующей колонки courses.price
    op.alter_column('courses', 'price',
               existing_type=sa.NUMERIC(precision=10, scale=2),
               server_default=None,
               existing_nullable=True)
    
    # Создаем таблицу course_media
    op.create_table(
        'course_media',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('filename', sa.String(), nullable=False),
        sa.Column('original_filename', sa.String(), nullable=False),
        sa.Column('custom_name', sa.String(), nullable=True),
        sa.Column('size', sa.BigInteger(), nullable=False),
        sa.Column('content_type', sa.String(), nullable=False),
        sa.Column('media_type', sa.String(), nullable=False),
        sa.Column('s3_key', sa.String(), nullable=False),
        sa.Column('course_id', sa.Integer(), nullable=True),
        sa.Column('lesson_id', sa.Integer(), nullable=True),
        sa.Column('width', sa.Integer(), nullable=True),
        sa.Column('height', sa.Integer(), nullable=True),
        sa.Column('duration', sa.Integer(), nullable=True),
        sa.Column('uploaded_by', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Создаем индексы
    op.create_index('ix_course_media_s3_key', 'course_media', ['s3_key'], unique=True)
    op.create_index('ix_course_media_course_id', 'course_media', ['course_id'], unique=False)
    op.create_index('ix_course_media_lesson_id', 'course_media', ['lesson_id'], unique=False)
    op.create_index('ix_course_media_media_type', 'course_media', ['media_type'], unique=False)
    op.create_index('ix_course_media_uploaded_by', 'course_media', ['uploaded_by'], unique=False)
    op.create_index('ix_course_media_created_at', 'course_media', ['created_at'], unique=False)
    
    # Создаем внешние ключи
    op.create_foreign_key(
        'fk_course_media_course_id',
        'course_media', 'courses',
        ['course_id'], ['id'],
        ondelete='CASCADE'
    )
    
    op.create_foreign_key(
        'fk_course_media_lesson_id',
        'course_media', 'lessons',
        ['lesson_id'], ['id'],
        ondelete='CASCADE'
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Удаляем внешние ключи
    op.drop_constraint('fk_course_media_lesson_id', 'course_media', type_='foreignkey')
    op.drop_constraint('fk_course_media_course_id', 'course_media', type_='foreignkey')
    
    # Удаляем индексы
    op.drop_index('ix_course_media_created_at', table_name='course_media')
    op.drop_index('ix_course_media_uploaded_by', table_name='course_media')
    op.drop_index('ix_course_media_media_type', table_name='course_media')
    op.drop_index('ix_course_media_lesson_id', table_name='course_media')
    op.drop_index('ix_course_media_course_id', table_name='course_media')
    op.drop_index('ix_course_media_s3_key', table_name='course_media')
    
    # Удаляем таблицу
    op.drop_table('course_media')
    
    # Возвращаем изменения в courses.price
    op.alter_column('courses', 'price',
               existing_type=sa.NUMERIC(precision=10, scale=2),
               server_default=sa.text('0.0'),
               existing_nullable=True)