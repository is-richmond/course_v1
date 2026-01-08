-- Create HomeworkSchedule table
CREATE TABLE IF NOT EXISTS homework_schedules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    days_of_week VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add homework_schedule_id column to user_streaks
ALTER TABLE user_streaks 
ADD COLUMN IF NOT EXISTS homework_schedule_id INTEGER NOT NULL DEFAULT 1;

-- Add foreign key constraint
ALTER TABLE user_streaks 
ADD CONSTRAINT fk_user_streaks_schedule 
FOREIGN KEY (homework_schedule_id) REFERENCES homework_schedules(id)
ON DELETE CASCADE;

-- Create default schedule (ПН-ЧТ = 1,2,3,4)
INSERT INTO homework_schedules (name, days_of_week, is_active) 
VALUES ('Основное расписание', '1,2,3,4', true)
ON CONFLICT DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_streaks_schedule 
ON user_streaks(homework_schedule_id);