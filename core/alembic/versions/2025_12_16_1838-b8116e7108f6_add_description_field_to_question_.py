"""Add description field to question_options

Revision ID: b8116e7108f6
Revises: 69a701b9043b
Create Date: 2025-12-16 18:38:18.896568+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b8116e7108f6'
down_revision: Union[str, Sequence[str], None] = '69a701b9043b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Добавляем только поле description в таблицу question_options
    op.add_column('question_options', sa.Column('description', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Удаляем поле description из таблицы question_options
    op.drop_column('question_options', 'description')