@echo off
REM AEON Docker Development Script for Windows
REM License: MIT

echo 🚀 Starting AEON Docker Development Environment...

REM Check if .env.local exists
if not exist .env.local (
    echo ⚠️  .env.local not found. Copying from .env.example...
    copy .env.example .env.local
    echo 📝 Please edit .env.local with your actual environment variables
)

REM Build and start services
echo 🔨 Building Docker containers...
docker-compose build

echo 🏃 Starting services...
docker-compose up -d

echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak > nul

REM Check service health
echo 🔍 Checking service health...

REM Check backend
curl -f http://localhost:8000/health > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Backend is healthy
) else (
    echo ❌ Backend health check failed
)

REM Check frontend
curl -f http://localhost:3000/api/health > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Frontend is healthy
) else (
    echo ❌ Frontend health check failed
)

echo.
echo 🎉 AEON Development Environment is ready!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📊 Redis: localhost:6379
echo.
echo 📋 Useful commands:
echo   docker-compose logs -f          # View all logs
echo   docker-compose logs -f frontend # View frontend logs
echo   docker-compose logs -f backend  # View backend logs
echo   docker-compose down             # Stop all services
echo   docker-compose down -v          # Stop and remove volumes
echo.
pause
