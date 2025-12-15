"""Update CourseMedia relationships

Revision ID: 69a701b9043b
Revises: d9f2f9ee5b49
Create Date: 2025-12-15 09:24:39.986844+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '69a701b9043b'
down_revision: Union[str, Sequence[str], None] = 'd9f2f9ee5b49'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
