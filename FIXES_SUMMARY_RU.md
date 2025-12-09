# Исправления: Связь Auth-Core и Эндпоинты Пользователей

## Проблемы (из описания задачи)

1. ✅ **В core должна быть связь с auth** - ИСПРАВЛЕНО
2. ✅ **Не найдены эндпоинты ответа юзера** - ИСПРАВЛЕНО

## Что было не так

### Дублирование моделей и эндпоинтов
- Core сервис имел свои копии User и Session моделей, которые импортировали из auth сервиса
- Core имел дубликаты эндпоинтов users.py и auth.py, которые копировали функционал auth сервиса
- Это создавало кроссерверную зависимость и нарушало архитектуру микросервисов

## Что было сделано

### 1. Удалены дублирующие файлы из Core
Удалены следующие файлы, которые дублировали функционал auth сервиса:
- `core/src/app/models/user.py` - модель User (осталась только в auth)
- `core/src/app/models/session.py` - модель Session (осталась только в auth)
- `core/src/app/repositories/user.py` - репозиторий User
- `core/src/app/repositories/session.py` - репозиторий Session
- `core/src/app/schemas/user.py` - схемы User
- `core/src/app/schemas/token.py` - схемы Token
- `core/src/app/schemas/schemas.py` - общие схемы
- `core/src/app/api/endpoints/users.py` - эндпоинты пользователей
- `core/src/app/api/endpoints/auth.py` - эндпоинты аутентификации
- `core/src/app/core/security.py` - утилиты безопасности

### 2. Исправлены зависимости
- Обновлён `core/src/app/api/deps.py` - теперь использует только собственную базу данных
- Удалены импорты из auth сервиса
- Удалены исключения, связанные с пользователями

### 3. Проверена работоспособность
- ✅ Core сервис запускается независимо без зависимостей от auth
- ✅ Auth сервис содержит все эндпоинты для работы с пользователями
- ✅ Оба сервиса протестированы и работают

## Где теперь находятся эндпоинты пользователей

### Auth Service (Порт 8001)

**Эндпоинты аутентификации:**
- `POST /api/v1/auth/register` - Регистрация нового пользователя
- `POST /api/v1/auth/login` - Вход пользователя (возвращает JWT токены)
- `POST /api/v1/auth/refresh` - Обновление access token
- `POST /api/v1/auth/change-password` - Смена пароля
- `POST /api/v1/auth/forgot-password` - Запрос сброса пароля
- `POST /api/v1/auth/reset-password` - Сброс пароля по токену
- `POST /api/v1/auth/admin` - Назначить права администратора

**Эндпоинты управления пользователями:**
- `GET /api/v1/users/me` - Получить информацию о текущем пользователе
- `PATCH /api/v1/users/me` - Обновить текущего пользователя
- `GET /api/v1/users/all` - Список всех пользователей (только админ)
- `GET /api/v1/users/{user_id}` - Получить пользователя по ID (только админ)
- `PATCH /api/v1/users/{user_id}` - Обновить пользователя (только админ)
- `DELETE /api/v1/users/{user_id}` - Удалить пользователя (только админ)

### Core Service (Порт 8000)

**Только эндпоинты курсов:**
- Курсы: `/api/v1/courses/*`
- Модули: `/api/v1/modules/*`
- Уроки: `/api/v1/lessons/*`
- Медиа: `/api/v1/media/*`
- Тесты: `/api/v1/tests/*`
- Вопросы: `/api/v1/questions/*`
- Варианты ответов: `/api/v1/options/*`
- Прогресс: `/api/v1/progress/*`

## Архитектура

Теперь сервисы полностью разделены:

1. **Auth Service** - отвечает за всё, что связано с пользователями:
   - Регистрация и вход
   - Управление пользователями
   - JWT токены
   - Пароли

2. **Core Service** - отвечает за содержание курсов:
   - Курсы и модули
   - Уроки и тесты
   - Прогресс обучения
   - Хранит только `author_id` и `user_id` как ссылки на пользователей

## Как запустить

### Auth Service
```bash
cd auth
pip install -r requirements.txt
PYTHONPATH=/path/to/project:$PYTHONPATH alembic upgrade head
PYTHONPATH=/path/to/project:$PYTHONPATH uvicorn auth.src.app.main:app --host 0.0.0.0 --port 8001
```

Документация: http://localhost:8001/api/v1/docs

### Core Service
```bash
cd core
pip install -r requirements.txt
PYTHONPATH=/path/to/project:$PYTHONPATH alembic upgrade head
PYTHONPATH=/path/to/project:$PYTHONPATH uvicorn core.src.app.main:app --host 0.0.0.0 --port 8000
```

Документация: http://localhost:8000/api/v1/docs

## Дополнительная документация

Подробная документация по архитектуре доступна в файле `ARCHITECTURE.md` (на английском).

## Безопасность

- ✅ Пройдена проверка кода (code review)
- ✅ Пройдено сканирование безопасности CodeQL
- ✅ Не найдено уязвимостей
