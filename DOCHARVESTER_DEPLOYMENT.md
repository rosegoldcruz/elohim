# DocHarvester Deployment Guide

This guide walks you through deploying DocHarvester as part of the AEON platform.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ and pnpm 8+ (for development)
- At least 4GB RAM available for containers

### 1. Build and Deploy

```bash
# Clone or navigate to your AEON repository
cd /path/to/aeon

# Build and start all services including DocHarvester
pnpm run docharvester:up

# Wait for services to start (30-60 seconds)
# Check status
docker-compose -f docker-compose.root.yml ps
```

### 2. Verify Installation

```bash
# Run integration tests
pnpm run test:docharvester
```

### 3. Access Points

- **AEON Platform**: http://localhost:3000
- **Documentation Center**: http://localhost:3000/docs
- **DocHarvester**: http://localhost:3000/docs/docharvester
- **Direct DocHarvester**: http://localhost:3001 (development)

## 📁 Project Structure

```
aeon/
├── apps/
│   └── docharvester/           # DocHarvester service
│       ├── frontend/           # HTML/CSS/JS interface
│       │   ├── index.html
│       │   ├── Dockerfile
│       │   └── nginx.conf
│       ├── backend/            # Python Flask API
│       │   ├── app.py
│       │   ├── processor.py
│       │   ├── requirements.txt
│       │   └── Dockerfile
│       ├── docker-compose.yml  # DocHarvester services
│       └── data/               # Processed documents
├── app/
│   ├── docs/                   # Documentation pages
│   │   ├── page.tsx           # Main docs router
│   │   ├── our-docs/          # AEON documentation
│   │   └── docharvester/      # DocHarvester integration
│   └── api/
│       └── docharvester/      # API proxy routes
├── components/
│   └── header.tsx             # Updated navigation
├── docker-compose.root.yml    # Main orchestration
└── scripts/
    └── test-docharvester.js   # Integration tests
```

## 🔧 Configuration

### Environment Variables

Add to your `.env.local`:

```env
# DocHarvester Configuration
DOCHARVESTER_BACKEND_URL=http://docharvester-backend:5000
DOCHARVESTER_FRONTEND_URL=http://docharvester-frontend:80

# Your existing environment variables
NEXTAUTH_SECRET=your-secret
DATABASE_URL=postgresql://...
```

### Docker Services

The integration adds these services to your stack:

- `docharvester-frontend`: Nginx-served interface
- `docharvester-backend`: Python Flask API with Selenium
- `web`: Your existing Next.js app (updated)

## 🧪 Testing

### Manual Testing

1. **Navigation Test**:
   - Go to http://localhost:3000
   - Click "Docs" in navigation
   - Verify both "Our Documentation" and "DocHarvester" cards appear

2. **DocHarvester Test**:
   - Click "Open DocHarvester"
   - Try auto-discovery with `https://docs.stripe.com`
   - Verify URLs are discovered and can be fetched

3. **API Test**:
   - Check that `/api/docharvester/discover` responds
   - Verify backend health at `/api/docharvester/health`

### Automated Testing

```bash
# Run full integration test suite
pnpm run test:docharvester

# Check individual services
curl http://localhost:3000/docs
curl http://localhost:3001/
curl http://localhost:5001/health
```

## 🐛 Troubleshooting

### Common Issues

1. **Services not starting**:
   ```bash
   # Check logs
   pnpm run docharvester:logs
   
   # Restart services
   pnpm run docharvester:down
   pnpm run docharvester:up
   ```

2. **Port conflicts**:
   - AEON app: 3000
   - DocHarvester frontend: 3001
   - DocHarvester backend: 5001
   
   Update ports in `docker-compose.root.yml` if needed.

3. **Memory issues**:
   ```bash
   # Increase Docker memory limit to 4GB+
   # Or reduce Chrome processes in backend
   ```

4. **Network issues**:
   ```bash
   # Check network connectivity
   docker network ls
   docker network inspect aeon_app-network
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose -f docker-compose.root.yml logs -f

# View specific service logs
docker-compose -f docker-compose.root.yml logs -f docharvester-backend
docker-compose -f docker-compose.root.yml logs -f docharvester-frontend
docker-compose -f docker-compose.root.yml logs -f web

# Enter container for debugging
docker-compose -f docker-compose.root.yml exec docharvester-backend bash
```

## 🔄 Updates and Maintenance

### Updating DocHarvester

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
pnpm run docharvester:down
pnpm run docharvester:up
```

### Data Management

```bash
# Backup processed documents
cp -r apps/docharvester/data/ backup/

# Clear processed data
rm -rf apps/docharvester/data/*
```

### Performance Tuning

1. **Backend scaling**:
   - Increase workers in `backend/Dockerfile`
   - Add load balancer for multiple backend instances

2. **Frontend caching**:
   - Configure Nginx caching in `frontend/nginx.conf`
   - Add CDN for static assets

3. **Database optimization**:
   - Use persistent volumes for data
   - Configure backup strategies

## 🚢 Production Deployment

### Docker Swarm

```bash
# Convert to swarm stack
docker swarm init
docker stack deploy -c docker-compose.root.yml aeon
```

### Kubernetes

```bash
# Generate Kubernetes manifests
kompose convert -f docker-compose.root.yml
kubectl apply -f .
```

### Cloud Deployment

- **AWS**: Use ECS or EKS
- **GCP**: Use Cloud Run or GKE  
- **Azure**: Use Container Instances or AKS
- **Vercel**: Deploy Next.js app, run DocHarvester separately

## 📊 Monitoring

### Health Checks

```bash
# Service health
curl http://localhost:3000/api/health
curl http://localhost:5001/health

# Resource usage
docker stats
```

### Metrics

- Monitor container resource usage
- Track API response times
- Monitor document processing rates
- Set up alerts for service failures

## 🔒 Security

### Production Considerations

1. **Environment Variables**: Use secrets management
2. **Network Security**: Configure firewalls and VPNs
3. **Container Security**: Regular image updates
4. **API Security**: Rate limiting and authentication
5. **Data Security**: Encrypt processed documents

### Access Control

- Restrict DocHarvester access to authenticated users
- Implement rate limiting for API endpoints
- Monitor and log all document extraction activities

## 📞 Support

For issues or questions:

1. Check logs: `pnpm run docharvester:logs`
2. Run tests: `pnpm run test:docharvester`
3. Review this guide and troubleshooting section
4. Contact the development team

## 🎉 Success!

If everything is working correctly, you should now have:

✅ DocHarvester fully integrated into AEON platform  
✅ Universal documentation extraction capabilities  
✅ LLM-ready document processing  
✅ Multiple export formats  
✅ Seamless user experience  

Your users can now extract documentation from ANY website directly within the AEON platform!
