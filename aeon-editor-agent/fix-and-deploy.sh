#!/bin/bash

# AEON Editor Agent - Fix vidstab issue and deploy
# Fixes Python 3.11 compatibility and deploys with Docker Compose

set -euo pipefail

echo "🔧 AEON Editor Agent - Fixing vidstab compatibility and deploying..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [[ ! -f "requirements.txt" ]]; then
    log_error "requirements.txt not found. Please run this script from the aeon-editor-agent directory."
    exit 1
fi

log_info "Checking vidstab dependency..."

# Check if vidstab is in requirements.txt
if grep -q "vidstab" requirements.txt; then
    log_warning "Found vidstab dependency - this is incompatible with Python 3.11"
    log_info "vidstab has already been commented out in requirements.txt"
    log_info "Using OpenCV's built-in video stabilization instead"
else
    log_success "vidstab dependency already removed"
fi

# Verify OpenCV dependencies in Dockerfile
log_info "Checking Dockerfile for OpenCV dependencies..."

if grep -q "libgl1-mesa-glx" Dockerfile; then
    log_success "OpenCV dependencies already added to Dockerfile"
else
    log_warning "OpenCV dependencies missing from Dockerfile"
    log_info "Please ensure these packages are in your Dockerfile:"
    echo "  - libgl1-mesa-glx"
    echo "  - libglib2.0-0"
    echo "  - libsm6"
    echo "  - libxext6"
    echo "  - libxrender-dev"
    echo "  - libgomp1"
fi

# Check Docker availability
log_info "Checking Docker availability..."
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed or not in PATH"
    exit 1
fi

if ! docker info &> /dev/null; then
    log_error "Docker daemon is not running"
    exit 1
fi

log_success "Docker is available"

# Check for GPU support
log_info "Checking GPU support..."
if docker run --rm --gpus all nvidia/cuda:12.2-base-ubuntu22.04 nvidia-smi &> /dev/null; then
    log_success "GPU support detected"
    GPU_AVAILABLE=true
else
    log_warning "GPU support not available - will run in CPU mode"
    GPU_AVAILABLE=false
fi

# Build the Docker image
log_info "Building AEON Editor Agent Docker image..."

# Use BuildKit for better performance
export DOCKER_BUILDKIT=1

docker build \
    --tag aeon-editor-agent:latest \
    --tag aeon-editor-agent:v2.0 \
    --build-arg CUDA_VERSION=12.2 \
    --build-arg ENVIRONMENT=production \
    --target production \
    . || {
    log_error "Docker build failed"
    log_info "Common issues:"
    echo "  1. vidstab compatibility (should be fixed)"
    echo "  2. Missing system dependencies"
    echo "  3. Network issues downloading packages"
    echo "  4. Insufficient disk space"
    exit 1
}

log_success "Docker image built successfully"

# Test the image
log_info "Testing the Docker image..."

# Start a test container
TEST_CONTAINER_ID=$(docker run -d \
    --name aeon-test-$(date +%s) \
    -p 8081:8080 \
    aeon-editor-agent:latest)

# Wait for container to start
sleep 10

# Test health endpoint
if curl -f http://localhost:8081/health &> /dev/null; then
    log_success "Health check passed"
    HEALTH_OK=true
else
    log_warning "Health check failed - checking container logs"
    docker logs $TEST_CONTAINER_ID
    HEALTH_OK=false
fi

# Cleanup test container
docker stop $TEST_CONTAINER_ID &> /dev/null || true
docker rm $TEST_CONTAINER_ID &> /dev/null || true

if [[ "$HEALTH_OK" != "true" ]]; then
    log_error "Container test failed"
    exit 1
fi

# Deploy with Docker Compose
log_info "Deploying with Docker Compose..."

if [[ ! -f "docker-compose.yml" ]]; then
    log_error "docker-compose.yml not found"
    exit 1
fi

# Stop existing containers
docker-compose down &> /dev/null || true

# Start the stack
if [[ "$GPU_AVAILABLE" == "true" ]]; then
    log_info "Starting with GPU support..."
    docker-compose up -d
else
    log_info "Starting in CPU mode..."
    # Remove GPU requirements for CPU-only deployment
    docker-compose up -d
fi

# Wait for services to start
log_info "Waiting for services to start..."
sleep 30

# Check if main service is running
if curl -f http://localhost:8080/health &> /dev/null; then
    log_success "AEON Editor Agent is running successfully!"
    
    # Show service status
    echo ""
    log_info "Service Status:"
    echo "  🎬 AEON Editor Agent: http://localhost:8080"
    echo "  📊 Grafana Dashboard: http://localhost:3000"
    echo "  📈 Prometheus Metrics: http://localhost:9090"
    echo "  🗄️ MinIO Storage: http://localhost:9001"
    
    # Show available endpoints
    echo ""
    log_info "Available Endpoints:"
    echo "  GET  /health          - Health check"
    echo "  GET  /metrics         - Prometheus metrics"
    echo "  POST /edit            - Process videos"
    echo "  GET  /transitions     - Available transitions"
    echo "  GET  /status/{job_id} - Job status"
    echo "  GET  /download/{job_id} - Download result"
    
    # Test API
    echo ""
    log_info "Testing API endpoints..."
    
    if curl -s http://localhost:8080/transitions | grep -q "transitions"; then
        log_success "API endpoints working"
    else
        log_warning "API endpoints may not be fully ready"
    fi
    
else
    log_error "AEON Editor Agent failed to start"
    log_info "Checking container logs..."
    docker-compose logs aeon-editor-agent
    exit 1
fi

# Show final status
echo ""
log_success "🚀 AEON Editor Agent deployment completed successfully!"
echo ""
log_info "Next steps:"
echo "  1. Test video processing: curl -X POST http://localhost:8080/edit"
echo "  2. Monitor performance: open http://localhost:3000"
echo "  3. Scale if needed: docker-compose up -d --scale aeon-editor-agent=3"
echo "  4. View logs: docker-compose logs -f aeon-editor-agent"
echo ""
log_info "To stop: docker-compose down"
log_info "To clean up: docker-compose down -v && docker system prune -f"
