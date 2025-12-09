# Course Platform Architecture

## Overview

This platform consists of two independent microservices:
- **Auth Service**: Handles user authentication and management
- **Core Service**: Handles course content and learning progress

## Service Architecture

### Auth Service (Port 8001)

**Purpose**: User authentication, authorization, and user management

**Endpoints**:
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login (returns JWT tokens)
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/change-password` - Change user password
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/admin` - Grant admin privileges (admin only)
- `GET /api/v1/users/me` - Get current user info
- `PATCH /api/v1/users/me` - Update current user
- `GET /api/v1/users/all` - List all users (admin only)
- `GET /api/v1/users/{user_id}` - Get user by ID (admin only)
- `PATCH /api/v1/users/{user_id}` - Update user (admin only)
- `DELETE /api/v1/users/{user_id}` - Delete user (admin only)

**Database**: SQLite (auth.db) with User and Session tables
- Uses UUID for user IDs
- Stores hashed passwords with bcrypt
- JWT-based authentication

**Models**:
- `User`: id (UUID), email, hashed_password, is_active, is_superuser, is_verified, timestamps
- `Session`: id, user_id, refresh_token, expires_at, timestamps

### Core Service (Port 8000)

**Purpose**: Course content management and learning progress tracking

**Endpoints**:
- **Courses**: CRUD operations for courses
  - `POST /api/v1/courses/` - Create course
  - `GET /api/v1/courses/` - List courses
  - `GET /api/v1/courses/{course_id}` - Get course
  - `GET /api/v1/courses/{course_id}/with-modules` - Get course with modules
  - `GET /api/v1/courses/author/{author_id}` - Get courses by author
  - `PUT /api/v1/courses/{course_id}` - Update course
  - `DELETE /api/v1/courses/{course_id}` - Delete course

- **Modules**: CRUD for course modules
- **Lessons**: CRUD for lessons (theory/test/practice)
- **Media**: CRUD for lesson attachments
- **Tests**: CRUD for tests and quizzes
- **Questions**: CRUD for test questions with points
- **Options**: CRUD for question answer options
- **Progress**: Track user learning progress

**Database**: SQLite (core.db) with course-related tables
- No User or Session tables (handled by Auth service)
- Stores `author_id` as integer/bigint reference to users

**Models**:
- `Course`: id, title, description, author_id, status, timestamps
- `CourseModule`: id, course_id, title, order_index
- `Lesson`: id, module_id, title, content, lesson_type, order_index
- `LessonMedia`: id, lesson_id, media_url, media_type, order_index
- `Test`: id, lesson_id, title, passing_score
- `TestQuestion`: id, test_id, question_text, question_type, points, order_index
- `QuestionOption`: id, question_id, option_text, is_correct
- `UserProgress`: id, user_id, course_id, lesson_id, completed, completed_at

## Service Independence

### Why Services are Separated

1. **Single Responsibility**: Each service has a clear, focused purpose
2. **Independent Scaling**: Auth and Core can scale independently
3. **Technology Flexibility**: Each service can use different tech stacks if needed
4. **Team Autonomy**: Different teams can work on each service
5. **Fault Isolation**: Issues in one service don't affect the other

### Cross-Service Communication

The services are designed to be independent:
- Core service stores `author_id` and `user_id` as simple integer/UUID references
- No direct database connections between services
- No shared models or schema definitions
- Future integration can be done via HTTP APIs or message queues

### User Management Flow

1. **User Registration/Login**: Use Auth service (`POST /api/v1/auth/register`, `POST /api/v1/auth/login`)
2. **Get JWT Token**: Auth service returns access and refresh tokens
3. **Create Course**: Pass token to Core service, use returned user ID as `author_id`
4. **Access Control**: Future implementation can verify tokens by calling Auth service

## Running the Services

### Auth Service

```bash
cd auth
pip install -r requirements.txt

# Run migrations
PYTHONPATH=/path/to/project:$PYTHONPATH alembic upgrade head

# Start server
PYTHONPATH=/path/to/project:$PYTHONPATH uvicorn auth.src.app.main:app --host 0.0.0.0 --port 8001
```

Access: http://localhost:8001/api/v1/docs

### Core Service

```bash
cd core
pip install -r requirements.txt

# Run migrations
PYTHONPATH=/path/to/project:$PYTHONPATH alembic upgrade head

# Start server
PYTHONPATH=/path/to/project:$PYTHONPATH uvicorn core.src.app.main:app --host 0.0.0.0 --port 8000
```

Access: http://localhost:8000/api/v1/docs

## Docker Compose

Both services can be run together using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- Auth service on port 8001
- Core service on port 8000

## API Documentation

Each service provides interactive API documentation via Swagger UI:
- Auth: http://localhost:8001/api/v1/docs
- Core: http://localhost:8000/api/v1/docs

## Configuration

Each service has its own configuration in `src/app/core/config.py`:

### Auth Service Settings
- `SECRET_KEY`: JWT secret key
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration (default: 30)
- `DATABASE_URL`: Database connection string
- `ALLOWED_ORIGINS`: CORS origins

### Core Service Settings
- `DATABASE_URL`: Database connection string
- `API_PREFIX`: API route prefix
- `AUTH_SERVICE_URL`: URL of auth service (for future integration)
- `S3_*`: S3/MinIO settings for media storage

## Security

- Auth service handles all password hashing and JWT token generation
- Core service is stateless and can verify tokens independently
- No passwords or sensitive auth data stored in Core service
- Each service has independent database and security boundaries

## Future Enhancements

1. **Token Verification**: Core can call Auth service to verify JWT tokens
2. **Service Mesh**: Use service mesh for inter-service communication
3. **API Gateway**: Add gateway for unified API access
4. **Event-Driven**: Use message queues for async communication
5. **Shared User Cache**: Redis cache for user info across services
