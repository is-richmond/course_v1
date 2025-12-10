"""Remove lesson_id from tests

Revision ID: ecface1a9028
Revises: abc123def456
Create Date: 2025-12-10 06:17:50.804980+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'ecface1a9028'
down_revision: Union[str, Sequence[str], None] = 'abc123def456'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to tests table
    op.add_column('tests', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('tests', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False))
    op.add_column('tests', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
    
    # Drop the foreign key constraint from tests to lessons
    op.drop_constraint('tests_lesson_id_fkey', 'tests', type_='foreignkey')
    
    # Remove lesson_id column completely
    op.drop_column('tests', 'lesson_id')


def downgrade() -> None:
    # Restore lesson_id column
    op.add_column('tests', sa.Column('lesson_id', sa.BIGINT(), autoincrement=False, nullable=False))
    
    # Restore foreign key constraint
    op.create_foreign_key('tests_lesson_id_fkey', 'tests', 'lessons', ['lesson_id'], ['id'], ondelete='CASCADE')
    
    # Drop new columns
    op.drop_column('tests', 'updated_at')
    op.drop_column('tests', 'created_at')
    op.drop_column('tests', 'description')