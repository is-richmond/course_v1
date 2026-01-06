-- 1. Создаем временную колонку для UUID
ALTER TABLE user_homework ADD COLUMN user_id_uuid UUID;
ALTER TABLE user_streaks ADD COLUMN user_id_uuid UUID;
ALTER TABLE user_guarantee ADD COLUMN user_id_uuid UUID;

-- 2. Если у вас есть таблица users с UUID, копируем оттуда
-- Предполагая, что старый user_id это telegram_id или есть связь
UPDATE user_homework uh
SET user_id_uuid = u.id
FROM users u
WHERE uh.user_id = u.telegram_id::text::integer;

UPDATE user_streaks us
SET user_id_uuid = u.id
FROM users u
WHERE us.user_id = u.telegram_id::text::integer;

UPDATE user_guarantee ug
SET user_id_uuid = u.id
FROM users u
WHERE ug.user_id = u.telegram_id::text::integer;

-- 3. Удаляем старую колонку
ALTER TABLE user_homework DROP CONSTRAINT IF EXISTS unique_user_date;
ALTER TABLE user_homework DROP COLUMN user_id;
ALTER TABLE user_streaks DROP COLUMN user_id;
ALTER TABLE user_guarantee DROP COLUMN user_id;

-- 4. Переименовываем новую колонку
ALTER TABLE user_homework RENAME COLUMN user_id_uuid TO user_id;
ALTER TABLE user_streaks RENAME COLUMN user_id_uuid TO user_id;
ALTER TABLE user_guarantee RENAME COLUMN user_id_uuid TO user_id;

-- 5. Добавляем constraints обратно
ALTER TABLE user_homework ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE user_streaks ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE user_guarantee ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE user_homework ADD CONSTRAINT unique_user_date UNIQUE (user_id, date);
ALTER TABLE user_streaks ADD CONSTRAINT user_streaks_user_id_unique UNIQUE (user_id);
ALTER TABLE user_guarantee ADD CONSTRAINT user_guarantee_user_id_unique UNIQUE (user_id);

-- 6. Создаем индексы
CREATE INDEX IF NOT EXISTS idx_user_homework_user_id ON user_homework(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_guarantee_user_id ON user_guarantee(user_id);