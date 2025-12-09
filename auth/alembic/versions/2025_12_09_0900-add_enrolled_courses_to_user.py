"""Add enrolled_courses to user table

Revision ID: def789ghi012
Revises: e7d033e3f8a1
Create Date: 2025-12-09 09:00:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'def789ghi012'
down_revision: Union[str, Sequence[str], None] = 'e7d033e3f8a1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # For SQLite, we'll use JSON text to store the array of course names
    # For PostgreSQL, this would be ARRAY(String)
    op.add_column('user', sa.Column('enrolled_courses', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('user', 'enrolled_courses')
