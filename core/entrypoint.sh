#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
until pg_isready -h postgres -U authuser; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - running migrations"
alembic upgrade head

echo "Starting application..."
exec uvicorn auth.src.app.main:app --host 0.0.0.0 --port 8000