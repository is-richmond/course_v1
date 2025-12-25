"""convert_all_user_id_to_string

Revision ID: 0f6b750a18d7
Revises: 5591d3798e9d
Create Date: 2025-12-25 14:08:14.769327+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0f6b750a18d7'
down_revision: Union[str, Sequence[str], None] = '5591d3798e9d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Convert all user_id columns from BIGINT to VARCHAR(36)"""
    
    # 1. user_progress table
    op.alter_column(
        'user_progress',
        'user_id',
        type_=sa.String(36),
        postgresql_using='user_id::varchar',
        existing_nullable=False
    )
    
    # 2. test_attempts table
    op.alter_column(
        'test_attempts',
        'user_id',
        type_=sa.String(36),
        postgresql_using='user_id::varchar',
        existing_nullable=False
    )


def downgrade() -> None:
    """Revert all user_id columns back to BIGINT"""
    
    # Note: This will fail if there are non-numeric UUIDs in the database
    # Only use this if you need to rollback before any data is inserted
    
    op.alter_column(
        'user_progress',
        'user_id',
        type_=sa.BigInteger(),
        postgresql_using='user_id::bigint',
        existing_nullable=False
    )
    
    op.alter_column(
        'test_attempts',
        'user_id',
        type_=sa.BigInteger(),
        postgresql_using='user_id::bigint',
        existing_nullable=False
    )