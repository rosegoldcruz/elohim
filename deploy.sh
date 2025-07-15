#!/bin/bash

# AEON Studio Deployment Script
# Deploys backend to Railway and frontend to Vercel

set -e

echo "🚀 Starting AEON Studio deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_tools() {
    echo "🔍 Checking required tools..."
    
    if ! command -v railway &> /dev/null; then
        echo -e "${RED}❌ Railway CLI not found. Install with: npm install -g @railway/cli${NC}"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Vercel CLI not found. Install with: npm install -g vercel${NC}"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git not found. Please install Git.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All tools are installed${NC}"
}

# Deploy backend to Railway
deploy_backend() {
    echo -e "${YELLOW}🐍 Deploying backend to Railway...${NC}"
    
    cd backend
    
    # Check if Railway project is initialized
    if [ ! -f ".railway/project.json" ]; then
        echo "Initializing Railway project..."
        railway init
    fi
    
    # Deploy to Railway
    railway up
    
    echo -e "${GREEN}✅ Backend deployed to Railway${NC}"
    cd ..
}

# Deploy frontend to Vercel
deploy_frontend() {
    echo -e "${YELLOW}🌐 Deploying frontend to Vercel...${NC}"
    
    cd frontend
    
    # Install dependencies
    pnpm install
    
    # Build the application
    pnpm build
    
    # Deploy to Vercel
    vercel --prod
    
    echo -e "${GREEN}✅ Frontend deployed to Vercel${NC}"
    cd ..
}

# Push to GitHub
push_to_github() {
    echo -e "${YELLOW}📚 Pushing to GitHub...${NC}"
    
    git add .
    git commit -m "Deploy AEON Studio - $(date)"
    git push origin main
    
    echo -e "${GREEN}✅ Pushed to GitHub${NC}"
}

# Main deployment flow
main() {
    check_tools
    
    echo "Choose deployment option:"
    echo "1) Deploy backend only"
    echo "2) Deploy frontend only"
    echo "3) Deploy both (recommended)"
    echo "4) Push to GitHub only"
    echo "5) Full deployment (GitHub + Railway + Vercel)"
    
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            deploy_backend
            ;;
        2)
            deploy_frontend
            ;;
        3)
            deploy_backend
            deploy_frontend
            ;;
        4)
            push_to_github
            ;;
        5)
            push_to_github
            deploy_backend
            deploy_frontend
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo ""
    echo "📋 Next steps:"
    echo "1. Check Railway dashboard: https://railway.app/dashboard"
    echo "2. Check Vercel dashboard: https://vercel.com/dashboard"
    echo "3. Test your application endpoints"
    echo "4. Monitor logs for any issues"
}

# Run main function
main "$@"
