#!/bin/bash

# AEON Viral Editor Agent - Deployment Script
# Supports Docker, Docker Compose, and Kubernetes deployments

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
IMAGE_NAME="aeon-editor-agent"
IMAGE_TAG="${IMAGE_TAG:-latest}"
NAMESPACE="${NAMESPACE:-aeon}"
ENVIRONMENT="${ENVIRONMENT:-development}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Help function
show_help() {
    cat << EOF
AEON Viral Editor Agent - Deployment Script

Usage: $0 [OPTIONS] COMMAND

Commands:
    build           Build Docker image
    push            Push Docker image to registry
    deploy-docker   Deploy using Docker
    deploy-compose  Deploy using Docker Compose
    deploy-k8s      Deploy to Kubernetes
    test            Run deployment tests
    clean           Clean up resources
    logs            Show application logs
    status          Show deployment status

Options:
    -e, --environment   Environment (development|staging|production) [default: development]
    -t, --tag          Docker image tag [default: latest]
    -n, --namespace    Kubernetes namespace [default: aeon]
    -r, --registry     Docker registry URL
    -h, --help         Show this help message

Examples:
    $0 build
    $0 deploy-compose
    $0 deploy-k8s --environment production --tag v2.0
    $0 test --environment staging

EOF
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check GPU support for production
    if [[ "$ENVIRONMENT" == "production" ]]; then
        if ! docker run --rm --gpus all nvidia/cuda:12.2-base-ubuntu22.04 nvidia-smi &> /dev/null; then
            log_warning "GPU support not available - will run in CPU mode"
        else
            log_success "GPU support detected"
        fi
    fi
    
    log_success "Prerequisites check completed"
}

# Build Docker image
build_image() {
    log_info "Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
    
    cd "$PROJECT_DIR"
    
    # Build with BuildKit for better performance
    DOCKER_BUILDKIT=1 docker build \
        --tag "${IMAGE_NAME}:${IMAGE_TAG}" \
        --tag "${IMAGE_NAME}:latest" \
        --build-arg CUDA_VERSION=12.2 \
        --build-arg ENVIRONMENT="$ENVIRONMENT" \
        --target production \
        .
    
    log_success "Docker image built successfully"
}

# Push image to registry
push_image() {
    if [[ -z "${REGISTRY:-}" ]]; then
        log_error "Registry URL not specified. Use --registry option."
        exit 1
    fi
    
    log_info "Pushing image to registry: ${REGISTRY}"
    
    # Tag for registry
    docker tag "${IMAGE_NAME}:${IMAGE_TAG}" "${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
    docker tag "${IMAGE_NAME}:${IMAGE_TAG}" "${REGISTRY}/${IMAGE_NAME}:latest"
    
    # Push to registry
    docker push "${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
    docker push "${REGISTRY}/${IMAGE_NAME}:latest"
    
    log_success "Image pushed to registry"
}

# Deploy with Docker
deploy_docker() {
    log_info "Deploying with Docker..."
    
    # Stop existing container
    docker stop aeon-editor-agent 2>/dev/null || true
    docker rm aeon-editor-agent 2>/dev/null || true
    
    # Run new container
    docker run -d \
        --name aeon-editor-agent \
        --restart unless-stopped \
        --gpus all \
        -p 8080:8080 \
        -v /tmp:/tmp \
        -e LOG_LEVEL=INFO \
        -e FASTAPI_ENV="$ENVIRONMENT" \
        "${IMAGE_NAME}:${IMAGE_TAG}"
    
    log_success "Docker deployment completed"
}

# Deploy with Docker Compose
deploy_compose() {
    log_info "Deploying with Docker Compose..."
    
    cd "$PROJECT_DIR"
    
    # Set environment variables
    export IMAGE_TAG
    export ENVIRONMENT
    
    # Choose compose file based on environment
    case "$ENVIRONMENT" in
        "production")
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
            ;;
        "staging")
            docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
            ;;
        *)
            docker-compose up -d
            ;;
    esac
    
    log_success "Docker Compose deployment completed"
}

# Deploy to Kubernetes
deploy_k8s() {
    log_info "Deploying to Kubernetes..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    
    cd "$PROJECT_DIR"
    
    # Create namespace if it doesn't exist
    kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply ConfigMaps and Secrets first
    kubectl apply -f k8s/configmap.yaml -n "$NAMESPACE"
    
    # Update image tag in deployment
    sed "s|image: aeon-editor-agent:.*|image: ${IMAGE_NAME}:${IMAGE_TAG}|g" k8s/deployment.yaml | \
        kubectl apply -f - -n "$NAMESPACE"
    
    # Wait for deployment to be ready
    kubectl rollout status deployment/aeon-editor-agent -n "$NAMESPACE" --timeout=300s
    
    log_success "Kubernetes deployment completed"
}

# Run tests
run_tests() {
    log_info "Running deployment tests..."
    
    # Wait for service to be ready
    sleep 30
    
    # Health check
    if curl -f http://localhost:8080/health &> /dev/null; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        return 1
    fi
    
    # API test
    if curl -f http://localhost:8080/transitions &> /dev/null; then
        log_success "API test passed"
    else
        log_error "API test failed"
        return 1
    fi
    
    log_success "All tests passed"
}

# Clean up resources
cleanup() {
    log_info "Cleaning up resources..."
    
    case "${1:-all}" in
        "docker")
            docker stop aeon-editor-agent 2>/dev/null || true
            docker rm aeon-editor-agent 2>/dev/null || true
            ;;
        "compose")
            cd "$PROJECT_DIR"
            docker-compose down -v
            ;;
        "k8s")
            kubectl delete namespace "$NAMESPACE" --ignore-not-found=true
            ;;
        "all")
            cleanup docker
            cleanup compose
            cleanup k8s
            docker system prune -f
            ;;
    esac
    
    log_success "Cleanup completed"
}

# Show logs
show_logs() {
    case "${1:-docker}" in
        "docker")
            docker logs -f aeon-editor-agent
            ;;
        "compose")
            cd "$PROJECT_DIR"
            docker-compose logs -f aeon-editor-agent
            ;;
        "k8s")
            kubectl logs -f deployment/aeon-editor-agent -n "$NAMESPACE"
            ;;
    esac
}

# Show status
show_status() {
    log_info "Deployment Status:"
    
    # Docker status
    if docker ps | grep -q aeon-editor-agent; then
        log_success "Docker: Running"
    else
        log_warning "Docker: Not running"
    fi
    
    # Docker Compose status
    cd "$PROJECT_DIR"
    if docker-compose ps | grep -q aeon-editor-agent; then
        log_success "Docker Compose: Running"
    else
        log_warning "Docker Compose: Not running"
    fi
    
    # Kubernetes status
    if kubectl get deployment aeon-editor-agent -n "$NAMESPACE" &> /dev/null; then
        READY=$(kubectl get deployment aeon-editor-agent -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}')
        DESIRED=$(kubectl get deployment aeon-editor-agent -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')
        log_success "Kubernetes: ${READY:-0}/${DESIRED:-0} replicas ready"
    else
        log_warning "Kubernetes: Not deployed"
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -t|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            COMMAND="$1"
            shift
            break
            ;;
    esac
done

# Validate environment
case "$ENVIRONMENT" in
    "development"|"staging"|"production")
        ;;
    *)
        log_error "Invalid environment: $ENVIRONMENT"
        exit 1
        ;;
esac

# Execute command
case "${COMMAND:-}" in
    "build")
        check_prerequisites
        build_image
        ;;
    "push")
        push_image
        ;;
    "deploy-docker")
        check_prerequisites
        deploy_docker
        ;;
    "deploy-compose")
        check_prerequisites
        deploy_compose
        ;;
    "deploy-k8s")
        check_prerequisites
        deploy_k8s
        ;;
    "test")
        run_tests
        ;;
    "clean")
        cleanup "${2:-all}"
        ;;
    "logs")
        show_logs "${2:-docker}"
        ;;
    "status")
        show_status
        ;;
    *)
        log_error "Unknown command: ${COMMAND:-}"
        show_help
        exit 1
        ;;
esac

log_success "Operation completed successfully!"
