# FastAPI Users Authentication Application

A complete authentication system built with FastAPI and FastAPI Users library, featuring JWT authentication, user management, and email verification.

## Features

- ✅ User registration
- ✅ JWT-based authentication (login/logout)
- ✅ User management (CRUD operations)
- ✅ Email verification (with stub implementation)
- ✅ Password reset functionality (with stub implementation)
- ✅ Protected endpoints
- ✅ SQLAlchemy 2.0+ with async support
- ✅ SQLite database (easily switchable to PostgreSQL)
- ✅ Automatic API documentation (Swagger UI)

## Installation

1. **Install dependencies:**

```bash
pip install -r requirements.txt
```

2. **Optional: Create a `.env` file for custom configuration:**

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite+aiosqlite:///./auth.db
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
```

## Running the Application

Start the application with:

```bash
uvicorn auth.main:app --reload
```

The API will be available at:
- Application: http://localhost:8000
- Interactive API docs (Swagger UI): http://localhost:8000/docs
- Alternative API docs (ReDoc): http://localhost:8000/redoc

## API Endpoints

### Authentication

#### Register a new user
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "strongpassword123"
}
```

**Response:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "is_active": true,
  "is_superuser": false,
  "is_verified": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": null
}
```

#### Login
```bash
POST /auth/jwt/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=strongpassword123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Logout
```bash
POST /auth/jwt/logout
Authorization: Bearer <access_token>
```

### User Management

#### Get current user
```bash
GET /users/me
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "is_active": true,
  "is_superuser": false,
  "is_verified": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": null
}
```

#### Get user by ID
```bash
GET /users/{user_id}
Authorization: Bearer <access_token>
```

#### Update user
```bash
PATCH /users/{user_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "password": "newpassword123"
}
```

#### Delete user
```bash
DELETE /users/{user_id}
Authorization: Bearer <access_token>
```

### Email Verification

#### Request verification token
```bash
POST /auth/request-verify-token
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify email
```bash
POST /auth/verify
Content-Type: application/json

{
  "token": "verification-token-here"
}
```

### Password Reset

#### Request password reset
```bash
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset password
```bash
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-here",
  "password": "newpassword123"
}
```

### Protected Endpoint

#### Example protected route
```bash
GET /protected
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Hello, user@example.com!",
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "is_active": true,
  "is_verified": false,
  "is_superuser": false
}
```

## Usage Examples with cURL

### 1. Register a new user
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpassword123"}'
```

### 2. Login
```bash
curl -X POST "http://localhost:8000/auth/jwt/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=testpassword123"
```

Save the access token from the response.

### 3. Get current user
```bash
curl -X GET "http://localhost:8000/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Access protected endpoint
```bash
curl -X GET "http://localhost:8000/protected" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Logout
```bash
curl -X POST "http://localhost:8000/auth/jwt/logout" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Project Structure

```
auth/
├── __init__.py          # Package initialization
├── main.py              # FastAPI application and routes
├── config.py            # Configuration settings
├── database.py          # Database setup and session management
├── models.py            # SQLAlchemy User model
├── schemas.py           # Pydantic schemas for validation
├── users.py             # FastAPI Users configuration
├── requirements.txt     # Python dependencies
└── README.md            # This file
```

## Configuration

The application uses the following configuration (set via environment variables or `.env` file):

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | Random string | Secret key for JWT tokens |
| `DATABASE_URL` | `sqlite+aiosqlite:///./auth.db` | Database connection URL |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | JWT token expiration time |
| `DEBUG` | `True` | Debug mode |

## Database

### SQLite (Default)
The application uses SQLite by default with async support via `aiosqlite`. The database file `auth.db` will be created automatically in the project root.

### Switching to PostgreSQL

To use PostgreSQL instead:

1. Install the PostgreSQL driver:
```bash
pip install asyncpg
```

2. Update the `DATABASE_URL` in your `.env` file:
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/dbname
```

## Security

- Passwords are hashed using Argon2id (more secure than bcrypt)
- JWT tokens have configurable expiration times
- Email verification and password reset tokens are secure
- Strong SECRET_KEY is recommended for production

**Important:** Change the `SECRET_KEY` in production! Generate a secure key using:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## User Model

The User model includes:

- `id` (UUID) - Primary key
- `email` (String) - Unique email address
- `hashed_password` (String) - Argon2id hashed password
- `is_active` (Boolean) - Account active status (default: True)
- `is_superuser` (Boolean) - Superuser privileges (default: False)
- `is_verified` (Boolean) - Email verified status (default: False)
- `created_at` (DateTime) - Account creation timestamp
- `updated_at` (DateTime) - Last update timestamp

## Development

### Type Checking
The code uses Python type hints throughout. Run type checking with:
```bash
mypy auth/
```

### Code Style
The code follows PEP 8 standards. Format code with:
```bash
black auth/
```

Check style with:
```bash
flake8 auth/
```

## Testing

To test the API, you can use:
- The interactive Swagger UI at `/docs`
- Postman or Insomnia
- cURL commands (see examples above)
- Python requests library

## Troubleshooting

### Common Issues

1. **Import errors**: Make sure you're in the parent directory of `auth/` when running uvicorn.

2. **Database errors**: If you get database errors, delete the `auth.db` file and restart the application.

3. **JWT token errors**: Ensure you're using the correct token format: `Bearer <token>`

## License

This project is provided as-is for educational purposes.
