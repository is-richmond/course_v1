"""Add descrition field

Revision ID: 9fa37925ff06
Revises: fb134d5133bb
Create Date: 2025-12-26 16:36:13.237162+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9fa37925ff06'
down_revision: Union[str, Sequence[str], None] = 'fb134d5133bb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""
    # 1. Добавляем поле description в таблицу test_questions
    op.add_column('test_questions', 
        sa.Column('description', sa.Text(), nullable=True)
    )
    
    # 2. Добавляем поле test_question_id в таблицу course_media
    op.add_column('course_media', 
        sa.Column('test_question_id', sa.Integer(), nullable=True)
    )
    
    # 3. Создаем индекс для test_question_id
    op.create_index(
        'ix_course_media_test_question_id', 
        'course_media', 
        ['test_question_id'], 
        unique=False
    )
    
    # 4. Создаем внешний ключ
    op.create_foreign_key(
        'fk_course_media_test_question_id',
        'course_media', 
        'test_questions',
        ['test_question_id'], 
        ['id'],
        ondelete='CASCADE'
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Удаляем внешний ключ
    op.drop_constraint(
        'fk_course_media_test_question_id', 
        'course_media', 
        type_='foreignkey'
    )
    
    # Удаляем индекс
    op.drop_index(
        'ix_course_media_test_question_id', 
        table_name='course_media'
    )
    
    # Удаляем поле test_question_id
    op.drop_column('course_media', 'test_question_id')
    
    # Удаляем поле description из test_questions
    op.drop_column('test_questions', 'description')