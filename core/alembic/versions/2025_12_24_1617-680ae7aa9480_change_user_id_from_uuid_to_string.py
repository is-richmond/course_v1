"""Change user_id from UUID to String

Revision ID: 680ae7aa9480
Revises: df3299183e4c
Create Date: 2025-12-24 16:17:55.297584+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '680ae7aa9480'
down_revision: Union[str, Sequence[str], None] = 'df3299183e4c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Изменить user_id в combined_tests
    op.alter_column(
        'combined_tests',
        'user_id',
        type_=sa.String(36),
        postgresql_using='user_id::text'
    )
    
    # Изменить user_id в combined_test_attempts
    op.alter_column(
        'combined_test_attempts',
        'user_id',
        type_=sa.String(36),
        postgresql_using='user_id::text'
    )


def downgrade() -> None:
    # Вернуть обратно к UUID
    op.alter_column(
        'combined_tests',
        'user_id',
        type_=postgresql.UUID(as_uuid=True),
        postgresql_using='user_id::uuid'
    )
    
    op.alter_column(
        'combined_test_attempts',
        'user_id',
        type_=postgresql.UUID(as_uuid=True),
        postgresql_using='user_id::uuid'
    )