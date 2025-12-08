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

### Using Docker (Recommended)

1. Copy the environment file and configure credentials:
```bash
cp .env.example .env
# Edit .env with your SECRET_KEY and other settings
```

2. Build and run with Docker Compose:
```bash
docker compose up -d
```

3. Access the application:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs

### Local Development

1. Install dependencies:
```bash
pip install -r auth/requirements.txt
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run the application:
```bash
uvicorn auth.main:app --reload
```

4. Open http://localhost:8000/docs for interactive API documentation.