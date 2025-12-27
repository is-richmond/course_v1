"""Add course_id to tests table

Revision ID: a1b2c3d4e5f6
Revises: 9fa37925ff06
Create Date: 2025-12-27

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '9fa37925ff06'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add course_id column to tests table
    op.add_column('tests', sa.Column('course_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_tests_course_id'), 'tests', ['course_id'], unique=False)
    op.create_foreign_key('fk_tests_course_id', 'tests', 'courses', ['course_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    # Remove course_id column from tests table
    op.drop_constraint('fk_tests_course_id', 'tests', type_='foreignkey')
    op.drop_index(op.f('ix_tests_course_id'), table_name='tests')
    op.drop_column('tests', 'course_id')
