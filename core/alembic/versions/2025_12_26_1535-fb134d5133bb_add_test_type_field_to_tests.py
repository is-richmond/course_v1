"""Add test_type field to tests

Revision ID: fb134d5133bb
Revises: 0f6b750a18d7
Create Date: 2025-12-26 15:35:54.766135+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fb134d5133bb'
down_revision: Union[str, Sequence[str], None] = '0f6b750a18d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add test_type column to tests table."""
    
    # Создаем ENUM тип для test_type
    op.execute("""
        CREATE TYPE testtype AS ENUM ('weekly', 'course_test', 'for_combined')
    """)
    
    # Добавляем колонку test_type с дефолтным значением
    op.add_column(
        'tests',
        sa.Column(
            'test_type',
            sa.Enum('weekly', 'course_test', 'for_combined', name='testtype'),
            nullable=False,
            server_default='for_combined'
        )
    )
    
    # Убираем server_default после добавления колонки
    op.alter_column(
        'tests',
        'test_type',
        server_default=None
    )


def downgrade() -> None:
    """Remove test_type column from tests table."""
    
    # Удаляем колонку
    op.drop_column('tests', 'test_type')
    
    # Удаляем ENUM тип
    op.execute("DROP TYPE testtype")