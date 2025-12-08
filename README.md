# course_v1

This repository contains a FastAPI authentication application with FastAPI Users.

## Projects

### FastAPI Users Authentication (`auth/`)

A complete authentication system built with FastAPI featuring:
- User registration and login
- JWT authentication
- User management endpoints
- Email verification
- Password reset functionality

See the [auth/README.md](auth/README.md) for detailed documentation and usage instructions.

## Quick Start

1. Navigate to the auth directory:
```bash
cd auth
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
uvicorn auth.main:app --reload
```

4. Open http://localhost:8000/docs for interactive API documentation.