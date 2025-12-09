"""Add price field to course and test attempts table

Revision ID: abc123def456
Revises: 2307f51c2395
Create Date: 2025-12-09 09:00:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'abc123def456'
down_revision: Union[str, Sequence[str], None] = '2307f51c2395'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add price column to courses table
    op.add_column('courses', sa.Column('price', sa.Numeric(precision=10, scale=2), nullable=True, server_default='0.0'))
    
    # Create test_attempts table for tracking user test submissions
    op.create_table('test_attempts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('test_id', sa.BigInteger(), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False, default=0),
        sa.Column('total_points', sa.Integer(), nullable=False, default=0),
        sa.Column('passed', sa.Boolean(), nullable=False, default=False),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['test_id'], ['tests.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create test_answers table for storing user answers
    op.create_table('test_answers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('attempt_id', sa.BigInteger(), nullable=False),
        sa.Column('question_id', sa.BigInteger(), nullable=False),
        sa.Column('selected_option_ids', sa.Text(), nullable=True),  # JSON array of selected option IDs
        sa.Column('text_answer', sa.Text(), nullable=True),
        sa.Column('is_correct', sa.Boolean(), nullable=True),
        sa.Column('points_earned', sa.Integer(), nullable=False, default=0),
        sa.ForeignKeyConstraint(['attempt_id'], ['test_attempts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['question_id'], ['test_questions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop test_answers table
    op.drop_table('test_answers')
    
    # Drop test_attempts table
    op.drop_table('test_attempts')
    
    # Remove price column from courses table
    op.drop_column('courses', 'price')
