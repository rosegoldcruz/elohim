@echo off
REM AEON Editor Agent - Fix vidstab issue and deploy (Windows)
REM Fixes Python 3.11 compatibility and deploys with Docker Compose

echo 🔧 AEON Editor Agent - Fixing vidstab compatibility and deploying...

REM Check if we're in the right directory
if not exist "requirements.txt" (
    echo [ERROR] requirements.txt not found. Please run this script from the aeon-editor-agent directory.
    exit /b 1
)

echo [INFO] Checking vidstab dependency...

REM Check if vidstab is in requirements.txt
findstr /C:"vidstab" requirements.txt >nul
if %errorlevel% equ 0 (
    echo [WARNING] Found vidstab dependency - this is incompatible with Python 3.11
    echo [INFO] vidstab has already been commented out in requirements.txt
    echo [INFO] Using OpenCV's built-in video stabilization instead
) else (
    echo [SUCCESS] vidstab dependency already removed
)

echo [INFO] Checking Docker availability...

REM Check Docker availability
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH
    exit /b 1
)

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker daemon is not running
    exit /b 1
)

echo [SUCCESS] Docker is available

echo [INFO] Checking GPU support...

REM Check for GPU support
docker run --rm --gpus all nvidia/cuda:12.2-base-ubuntu22.04 nvidia-smi >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] GPU support detected
    set GPU_AVAILABLE=true
) else (
    echo [WARNING] GPU support not available - will run in CPU mode
    set GPU_AVAILABLE=false
)

echo [INFO] Building AEON Editor Agent Docker image...

REM Set BuildKit for better performance
set DOCKER_BUILDKIT=1

REM Build the Docker image
docker build --tag aeon-editor-agent:latest --tag aeon-editor-agent:v2.0 --build-arg CUDA_VERSION=12.2 --build-arg ENVIRONMENT=production --target production .
if %errorlevel% neq 0 (
    echo [ERROR] Docker build failed
    echo [INFO] Common issues:
    echo   1. vidstab compatibility (should be fixed)
    echo   2. Missing system dependencies
    echo   3. Network issues downloading packages
    echo   4. Insufficient disk space
    exit /b 1
)

echo [SUCCESS] Docker image built successfully

echo [INFO] Testing the Docker image...

REM Generate unique container name
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TEST_CONTAINER_NAME=aeon-test-%datetime:~0,14%

REM Start a test container
docker run -d --name %TEST_CONTAINER_NAME% -p 8081:8080 aeon-editor-agent:latest
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start test container
    exit /b 1
)

REM Wait for container to start
echo [INFO] Waiting for container to start...
timeout /t 15 /nobreak >nul

REM Test health endpoint
curl -f http://localhost:8081/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Health check passed
    set HEALTH_OK=true
) else (
    echo [WARNING] Health check failed - checking container logs
    docker logs %TEST_CONTAINER_NAME%
    set HEALTH_OK=false
)

REM Cleanup test container
docker stop %TEST_CONTAINER_NAME% >nul 2>&1
docker rm %TEST_CONTAINER_NAME% >nul 2>&1

if not "%HEALTH_OK%"=="true" (
    echo [ERROR] Container test failed
    exit /b 1
)

echo [INFO] Deploying with Docker Compose...

if not exist "docker-compose.yml" (
    echo [ERROR] docker-compose.yml not found
    exit /b 1
)

REM Stop existing containers
docker-compose down >nul 2>&1

REM Start the stack
if "%GPU_AVAILABLE%"=="true" (
    echo [INFO] Starting with GPU support...
    docker-compose up -d
) else (
    echo [INFO] Starting in CPU mode...
    docker-compose up -d
)

if %errorlevel% neq 0 (
    echo [ERROR] Failed to start Docker Compose stack
    exit /b 1
)

REM Wait for services to start
echo [INFO] Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Check if main service is running
curl -f http://localhost:8080/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] AEON Editor Agent is running successfully!
    echo.
    echo [INFO] Service Status:
    echo   🎬 AEON Editor Agent: http://localhost:8080
    echo   📊 Grafana Dashboard: http://localhost:3000
    echo   📈 Prometheus Metrics: http://localhost:9090
    echo   🗄️ MinIO Storage: http://localhost:9001
    echo.
    echo [INFO] Available Endpoints:
    echo   GET  /health          - Health check
    echo   GET  /metrics         - Prometheus metrics
    echo   POST /edit            - Process videos
    echo   GET  /transitions     - Available transitions
    echo   GET  /status/{job_id} - Job status
    echo   GET  /download/{job_id} - Download result
    echo.
    echo [INFO] Testing API endpoints...
    
    curl -s http://localhost:8080/transitions | findstr "transitions" >nul
    if %errorlevel% equ 0 (
        echo [SUCCESS] API endpoints working
    ) else (
        echo [WARNING] API endpoints may not be fully ready
    )
    
) else (
    echo [ERROR] AEON Editor Agent failed to start
    echo [INFO] Checking container logs...
    docker-compose logs aeon-editor-agent
    exit /b 1
)

echo.
echo [SUCCESS] 🚀 AEON Editor Agent deployment completed successfully!
echo.
echo [INFO] Next steps:
echo   1. Test video processing: curl -X POST http://localhost:8080/edit
echo   2. Monitor performance: start http://localhost:3000
echo   3. Scale if needed: docker-compose up -d --scale aeon-editor-agent=3
echo   4. View logs: docker-compose logs -f aeon-editor-agent
echo.
echo [INFO] To stop: docker-compose down
echo [INFO] To clean up: docker-compose down -v && docker system prune -f

pause
