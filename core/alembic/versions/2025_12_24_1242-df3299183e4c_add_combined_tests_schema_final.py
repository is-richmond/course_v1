"""Add combined tests schema (final)

Revision ID: df3299183e4c
Revises: f19847d8126c
Create Date: 2025-12-24 12:42:14.109816+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'df3299183e4c'
down_revision: Union[str, Sequence[str], None] = 'f19847d8126c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ---------- combined_tests ----------
    op.create_table(
        'combined_tests',
        sa.Column('id', sa.BigInteger(), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('total_questions', sa.Integer(), nullable=False),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
    )

    op.create_index(
        'ix_combined_tests_user_id',
        'combined_tests',
        ['user_id'],
    )

    # ---------- combined_test_sources ----------
    op.create_table(
        'combined_test_sources',
        sa.Column('id', sa.BigInteger(), primary_key=True),
        sa.Column('combined_test_id', sa.BigInteger(), nullable=False),
        sa.Column('source_test_id', sa.BigInteger(), nullable=False),
        sa.Column('questions_count', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ['combined_test_id'],
            ['combined_tests.id'],
            ondelete='CASCADE',
        ),
        sa.ForeignKeyConstraint(
            ['source_test_id'],
            ['tests.id'],
            ondelete='CASCADE',
        ),
    )

    op.create_index(
        'ix_combined_test_sources_combined_test_id',
        'combined_test_sources',
        ['combined_test_id'],
    )

    # ---------- combined_test_questions ----------
    op.create_table(
        'combined_test_questions',
        sa.Column('id', sa.BigInteger(), primary_key=True),
        sa.Column('combined_test_id', sa.BigInteger(), nullable=False),
        sa.Column('question_id', sa.BigInteger(), nullable=False),
        sa.Column('order_index', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ['combined_test_id'],
            ['combined_tests.id'],
            ondelete='CASCADE',
        ),
        sa.ForeignKeyConstraint(
            ['question_id'],
            ['test_questions.id'],
            ondelete='CASCADE',
        ),
    )

    op.create_index(
        'ix_combined_test_questions_combined_test_id',
        'combined_test_questions',
        ['combined_test_id'],
    )

    # ---------- combined_test_attempts ----------
    op.create_table(
        'combined_test_attempts',
        sa.Column('id', sa.BigInteger(), primary_key=True),
        sa.Column('combined_test_id', sa.BigInteger(), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            'score',
            sa.Integer(),
            nullable=False,
            server_default='0',
        ),
        sa.Column('total_questions', sa.Integer(), nullable=False),
        sa.Column(
            'started_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ['combined_test_id'],
            ['combined_tests.id'],
            ondelete='CASCADE',
        ),
    )

    op.create_index(
        'ix_combined_test_attempts_user_id',
        'combined_test_attempts',
        ['user_id'],
    )

    # ---------- combined_test_answers ----------
    op.create_table(
        'combined_test_answers',
        sa.Column('id', sa.BigInteger(), primary_key=True),
        sa.Column('attempt_id', sa.BigInteger(), nullable=False),
        sa.Column('question_id', sa.BigInteger(), nullable=False),
        sa.Column('selected_option_ids', sa.Text(), nullable=True),
        sa.Column('text_answer', sa.Text(), nullable=True),
        sa.Column(
            'is_correct',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('false'),
        ),
        sa.Column(
            'points_earned',
            sa.Integer(),
            nullable=False,
            server_default='0',
        ),
        sa.ForeignKeyConstraint(
            ['attempt_id'],
            ['combined_test_attempts.id'],
            ondelete='CASCADE',
        ),
        sa.ForeignKeyConstraint(
            ['question_id'],
            ['test_questions.id'],
            ondelete='CASCADE',
        ),
    )

    op.create_index(
        'ix_combined_test_answers_attempt_id',
        'combined_test_answers',
        ['attempt_id'],
    )


def downgrade() -> None:
    # Обычно в dev достаточно pass
    pass