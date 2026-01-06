-- Initial database schema for Homework Bot

-- Reminder types table
CREATE TABLE IF NOT EXISTS reminder_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    time TIME NOT NULL,
    days_of_week VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Reminder message pool table
CREATE TABLE IF NOT EXISTS reminder_messages (
    id SERIAL PRIMARY KEY,
    reminder_type_id INTEGER REFERENCES reminder_types(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User homework submissions table
CREATE TABLE IF NOT EXISTS user_homework (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    anki_submitted BOOLEAN DEFAULT FALSE,
    anki_photo_url VARCHAR(500),
    anki_submitted_at TIMESTAMP,
    test_submitted BOOLEAN DEFAULT FALSE,
    test_photo_url VARCHAR(500),
    test_submitted_at TIMESTAMP,
    lesson_submitted BOOLEAN DEFAULT FALSE,
    lesson_photo_url VARCHAR(500),
    lesson_submitted_at TIMESTAMP,
    is_complete BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- User streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_completed_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Streak messages table
CREATE TABLE IF NOT EXISTS streak_messages (
    id SERIAL PRIMARY KEY,
    streak_days INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User guarantee table
CREATE TABLE IF NOT EXISTS user_guarantee (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    has_guarantee BOOLEAN DEFAULT TRUE,
    notes TEXT,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Welcome messages table
CREATE TABLE IF NOT EXISTS welcome_messages (
    id SERIAL PRIMARY KEY,
    message_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    button_text VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_homework_user_date ON user_homework(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_homework_date ON user_homework(date);
CREATE INDEX IF NOT EXISTS idx_user_homework_complete ON user_homework(is_complete);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_types_active ON reminder_types(is_active);
CREATE INDEX IF NOT EXISTS idx_reminder_messages_type ON reminder_messages(reminder_type_id);
CREATE INDEX IF NOT EXISTS idx_streak_messages_days ON streak_messages(streak_days);

-- Insert default welcome messages
INSERT INTO welcome_messages (message_type, title, message) VALUES
('welcome', 'Приветствие', 
'👋 <b>Привет! Я бот-помощник для курса!</b>

Я помогу тебе:
✅ Отслеживать выполнение домашних заданий
✅ Напоминать о дедлайнах
✅ Поддерживать твою серию выполнения
✅ Следить за статусом гарантии

Выбери интересующий раздел:'),

('how_to_use', 'Как пользоваться', 
'📖 <b>Как пользоваться ботом</b>

1️⃣ <b>Загрузка ДЗ</b>
Каждый день нужно загрузить 3 скриншота:
• 📝 Anki карточки
• 📋 Тест
• 🎓 Урок

2️⃣ <b>Напоминания</b>
Бот будет напоминать:
• 21:00 - ДЗ на завтра
• 11:00 - первое напоминание
• 20:00 - последнее напоминание
• 00:00 - статус выполнения

3️⃣ <b>Серия выполнения</b>
За регулярное выполнение ДЗ вы получите поздравления!

4️⃣ <b>Гарантия</b>
Выполняйте все задания вовремя для сохранения гарантии'),

('guarantee', 'Гарантия',
'🛡️ <b>Как работает гарантия</b>

✅ <b>Условия сохранения гарантии:</b>

1. Выполнять ВСЕ 3 типа ДЗ каждый день
2. Загружать ДЗ до 00:00
3. Не пропускать ни одного дня

⚠️ <b>Гарантия аннулируется если:</b>

• Пропущен хотя бы один день
• Загружено не все ДЗ
• Нарушены правила курса

💡 <b>Проверка гарантии:</b>
Используйте кнопку в меню для проверки статуса'),

('anki', 'Anki туториал',
'📚 <b>Туториал Anki</b>

Anki - это программа для запоминания информации через карточки.

🎯 <b>Как использовать:</b>

1. Скачайте Anki: https://apps.ankiweb.net/
2. Создайте карточки с вопросами
3. Повторяйте их каждый день
4. Делайте скриншот статистики

📸 <b>Что загружать:</b>
Скриншот экрана с количеством повторенных карточек за день

💡 <b>Совет:</b>
Лучше делать карточки сразу после изучения темы!')
ON CONFLICT DO NOTHING;

-- Insert default streak messages
INSERT INTO streak_messages (streak_days, message) VALUES
(3, '🔥 <b>Отлично! 3 дня подряд!</b>

Ты на правильном пути к своей цели! Так держать! 💪'),

(5, '🎉 <b>Невероятно! Уже 5 дней!</b>

Твоя дисциплина вызывает уважение! Продолжай в том же духе! 🚀'),

(7, '🏆 <b>Целая неделя! 7 дней подряд!</b>

Это серьезное достижение! Ты доказываешь, что можешь многое! 🌟'),

(10, '💎 <b>10 дней! Ты легенда!</b>

Твоя упорность впечатляет! Ты уже создал сильную привычку! 💪'),

(14, '🌟 <b>2 недели непрерывного прогресса!</b>

Ты настоящий профессионал! Продолжай покорять вершины! 🎯'),

(21, '👑 <b>21 день! Ты король дисциплины!</b>

Психологи говорят, что именно столько нужно для формирования привычки. Ты сделал это! 🔥'),

(30, '🎊 <b>МЕСЯЦ! Это невероятно!</b>

Твои результаты вдохновляют других! Ты образец для подражания! 🏅')
ON CONFLICT DO NOTHING;