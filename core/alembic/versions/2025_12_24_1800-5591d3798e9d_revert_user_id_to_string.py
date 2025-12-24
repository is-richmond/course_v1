"""revert_user_id_to_string

Revision ID: 5591d3798e9d
Revises: d0f551c5b83e
Create Date: 2025-12-24 18:00:15.843523+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5591d3798e9d'
down_revision: Union[str, Sequence[str], None] = 'd0f551c5b83e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'combined_tests',
        'user_id',
        type_=sa.String(36),
        postgresql_using='user_id::varchar'
    )
    
    op.alter_column(
        'combined_test_attempts',
        'user_id',
        type_=sa.String(36),
        postgresql_using='user_id::varchar'
    )