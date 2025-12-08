# Docker Deployment Guide

This guide explains how to run the FastAPI Users Authentication application using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

1. **Clone the repository and navigate to project directory:**

```bash
git clone <repository-url>
cd course_v1
```

2. **Configure environment variables:**

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
SECRET_KEY=your-secure-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite+aiosqlite:///./data/auth.db
DEBUG=True
```

**⚠️ Important:** For production, generate a secure SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

3. **Build and start the application:**

```bash
docker compose up -d
```

4. **Verify the application is running:**

```bash
docker compose ps
```

## Accessing the Application

Once running, the application is available at:

- **API Base URL:** http://localhost:8000
- **Interactive API Docs (Swagger UI):** http://localhost:8000/docs
- **Alternative API Docs (ReDoc):** http://localhost:8000/redoc

## Docker Compose Commands

### Start the application
```bash
docker compose up -d
```

### View logs
```bash
# All services
docker compose logs -f

# Just the app service
docker compose logs -f app
```

### Stop the application
```bash
docker compose down
```

### Stop and remove volumes (⚠️ deletes database)
```bash
docker compose down -v
```

### Rebuild the application
```bash
docker compose up -d --build
```

### Restart a service
```bash
docker compose restart app
```

## Using PostgreSQL Instead of SQLite

To use PostgreSQL instead of SQLite:

1. **Uncomment the PostgreSQL service in `docker compose.yml`:**

```yaml
postgres:
  image: postgres:16-alpine
  container_name: fastapi-auth-postgres
  environment:
    - POSTGRES_USER=${POSTGRES_USER:-authuser}
    - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-authpass}
    - POSTGRES_DB=${POSTGRES_DB:-authdb}
  ports:
    - "5432:5432"
  volumes:
    - postgres-data:/var/lib/postgresql/data
  networks:
    - auth-network
  restart: unless-stopped
```

And uncomment the volume:
```yaml
volumes:
  sqlite-data:
  postgres-data:  # Uncomment this line
```

2. **Update your `.env` file:**

```env
DATABASE_URL=postgresql+asyncpg://authuser:authpass@postgres:5432/authdb
POSTGRES_USER=authuser
POSTGRES_PASSWORD=authpass
POSTGRES_DB=authdb
```

3. **Install the PostgreSQL driver** by updating `auth/requirements.txt`:

Add this line:
```
asyncpg>=0.29.0
```

4. **Rebuild and restart:**

```bash
docker compose down
docker compose up -d --build
```

## Development with Docker

### Live Code Reloading

The `docker compose.yml` is configured with volume mounts for development:

```yaml
volumes:
  - ./auth:/app/auth
```

Changes to files in the `auth/` directory will be reflected in the container. To enable auto-reload, modify the CMD in `Dockerfile` or override in `docker compose.yml`:

```yaml
command: uvicorn auth.main:app --host 0.0.0.0 --port 8000 --reload
```

### Accessing the Container Shell

```bash
docker compose exec app bash
```

Or if the container is not running:
```bash
docker compose run --rm app bash
```

### Running Commands in Container

```bash
# Run database migrations (if you add them)
docker compose exec app python -m alembic upgrade head

# Access Python shell
docker compose exec app python

# Run tests (if you add them)
docker compose exec app pytest
```

## Production Deployment

### Security Checklist

- [ ] Change `SECRET_KEY` to a strong, randomly generated value
- [ ] Set `DEBUG=False` in production
- [ ] Use PostgreSQL instead of SQLite for production
- [ ] Use strong database passwords
- [ ] Configure proper firewall rules
- [ ] Use HTTPS (configure reverse proxy like Nginx)
- [ ] Set up proper logging and monitoring
- [ ] Configure backup strategy for database
- [ ] Review and restrict Docker network access

### Environment Variables for Production

```env
SECRET_KEY=<generated-secure-key>
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=postgresql+asyncpg://username:password@postgres:5432/dbname
DEBUG=False
APP_NAME=FastAPI Users Authentication
```

### Recommended Production Setup

1. **Use a reverse proxy (Nginx/Traefik)** for HTTPS and load balancing
2. **Set resource limits** in docker compose.yml:

```yaml
services:
  app:
    # ... other config
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

3. **Configure health checks** (already included in Dockerfile)
4. **Use Docker secrets** for sensitive data instead of environment variables
5. **Set up automated backups** for the database volume

## Troubleshooting

### Container won't start

Check logs:
```bash
docker compose logs app
```

### Database connection errors

Verify DATABASE_URL in `.env` matches your database configuration:
```bash
docker compose exec app env | grep DATABASE_URL
```

### Permission issues with volumes

Fix permissions:
```bash
sudo chown -R $USER:$USER ./data
```

### Port already in use

Change the port mapping in `docker compose.yml`:
```yaml
ports:
  - "8001:8000"  # Changed from 8000:8000
```

### Application can't connect to PostgreSQL

Ensure the postgres service is healthy:
```bash
docker compose ps postgres
docker compose logs postgres
```

Wait a few seconds after starting for PostgreSQL to be ready.

## Monitoring and Maintenance

### View Container Resource Usage

```bash
docker stats
```

### Check Container Health

```bash
docker compose ps
```

### Export Database (SQLite)

```bash
docker compose exec app sqlite3 /app/data/auth.db .dump > backup.sql
```

### Export Database (PostgreSQL)

```bash
docker compose exec postgres pg_dump -U authuser authdb > backup.sql
```

## Cleaning Up

### Remove stopped containers
```bash
docker compose down
```

### Remove containers and volumes
```bash
docker compose down -v
```

### Remove images
```bash
docker compose down --rmi all
```

### Complete cleanup
```bash
docker compose down -v --rmi all --remove-orphans
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [FastAPI Users Documentation](https://fastapi-users.github.io/fastapi-users/)
