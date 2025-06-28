#!/bin/bash

# AEON Docker Development Script
# License: MIT

set -e

echo "🚀 Starting AEON Docker Development Environment..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Copying from .env.example..."
    cp .env.example .env.local
    echo "📝 Please edit .env.local with your actual environment variables"
fi

# Build and start services
echo "🔨 Building Docker containers..."
docker-compose build

echo "🏃 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check backend
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

# Check frontend
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

# Check Redis
if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is healthy"
else
    echo "❌ Redis health check failed"
fi

echo ""
echo "🎉 AEON Development Environment is ready!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📊 Redis: localhost:6379"
echo ""
echo "📋 Useful commands:"
echo "  docker-compose logs -f          # View all logs"
echo "  docker-compose logs -f frontend # View frontend logs"
echo "  docker-compose logs -f backend  # View backend logs"
echo "  docker-compose down             # Stop all services"
echo "  docker-compose down -v          # Stop and remove volumes"
echo ""
