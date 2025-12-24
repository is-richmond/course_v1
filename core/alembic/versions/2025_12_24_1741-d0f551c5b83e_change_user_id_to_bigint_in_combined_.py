"""change_user_id_to_bigint_in_combined_tests

Revision ID: d0f551c5b83e
Revises: 680ae7aa9480
Create Date: 2025-12-24 17:41:00.879311+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd0f551c5b83e'
down_revision: Union[str, Sequence[str], None] = '680ae7aa9480'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Изменить user_id с VARCHAR на BIGINT в combined_tests
    op.alter_column(
        'combined_tests',
        'user_id',
        type_=sa.BigInteger(),
        postgresql_using='user_id::bigint'
    )
    
    # Изменить user_id с VARCHAR на BIGINT в combined_test_attempts
    op.alter_column(
        'combined_test_attempts',
        'user_id',
        type_=sa.BigInteger(),
        postgresql_using='user_id::bigint'
    )


def downgrade() -> None:
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