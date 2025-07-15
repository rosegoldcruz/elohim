# AEON Video Processing Agent

Python 3.11 video processing agent for the AEON AI video generation platform. Handles viral video editing with MoviePy, FFMPEG, and AI-powered effects.

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Docker (recommended)
- FFMPEG
- Supabase account
- Vercel Blob storage (or S3)

### Local Development

1. **Clone and setup:**
```bash
cd aeon-editor-agent
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Environment setup:**
```bash
cp .env.example .env
# Fill in your environment variables
```

3. **Required environment variables:**
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Storage Configuration
BLOB_READ_WRITE_TOKEN=vercel_blob_your-token

# AI Services (Optional)
OPENAI_API_KEY=sk-your-openai-key
REPLICATE_API_TOKEN=r8_your-replicate-token

# Application Configuration
ENVIRONMENT=development
LOG_LEVEL=INFO
POLL_INTERVAL=5
MAX_CONCURRENT_JOBS=3
TEMP_DIR=/tmp/aeon
OUTPUT_DIR=/tmp/aeon/output
PORT=8000
```

4. **Run the agent:**
```bash
python main.py
```

The agent will start polling Supabase for jobs every 5 seconds.

### Docker Development

```bash
# Build image
docker build -f Dockerfile.production -t aeon-agent .

# Run container
docker run -d \
  --name aeon-agent \
  -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/temp:/app/temp \
  -v $(pwd)/output:/app/output \
  aeon-agent
```

### Docker Compose

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.production.yml up -d
```

## 🎬 Video Processing Pipeline

### Job Flow

1. **Job Polling**: Agent polls `agent_jobs` table every 5 seconds
2. **Job Validation**: Validates job data and user credits
3. **Video Generation**: Creates viral video based on job parameters
4. **Effects Processing**: Applies viral transitions and effects
5. **Audio Addition**: Adds background music based on style
6. **Text Overlays**: Adds captions and title overlays
7. **Export**: Renders final MP4 video
8. **Upload**: Uploads to Vercel Blob storage
9. **Completion**: Updates job status with output URL

### Supported Styles

- **Viral**: Fast-paced with trending transitions and effects
- **Cinematic**: Professional with cinematic bars and color grading
- **Casual**: Natural look with minimal processing
- **Professional**: Clean and polished for business content

### Video Effects

- **Transitions**: zoom_in, zoom_out, slide_left, slide_right, fade, spin, shake
- **Effects**: speed_ramp, freeze_frame, color_pop, vignette, film_grain
- **Audio**: Dynamic background music based on style
- **Text**: Animated title cards and description overlays

## 📁 Project Structure

```
aeon-editor-agent/
├── src/
│   ├── __init__.py
│   ├── config.py          # Configuration management
│   ├── database.py        # Supabase operations
│   ├── storage.py         # File storage (Vercel Blob)
│   ├── video_processor.py # Main video processing
│   ├── video_effects.py   # Effects and transitions
│   ├── job_processor.py   # Job polling and management
│   └── logger.py          # Logging utilities
├── main.py               # Application entry point
├── requirements.txt      # Python dependencies
├── Dockerfile.production # Production Docker image
├── docker-compose.yml    # Local development
├── railway.json         # Railway deployment config
└── .env.example         # Environment template
```

## 🚀 Deployment to Railway

### Automatic Deployment

1. **Connect to Railway:**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the `aeon-editor-agent` folder

2. **Set environment variables:**
   - Add all variables from `.env.example`
   - Railway will automatically detect `railway.json`

3. **Deploy:**
   - Railway will build using `Dockerfile.production`
   - Health checks will monitor `/health` endpoint

### Manual Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### Environment Variables in Railway

Set these in Railway dashboard:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
BLOB_READ_WRITE_TOKEN=vercel_blob_your-token
ENVIRONMENT=production
LOG_LEVEL=INFO
POLL_INTERVAL=5
MAX_CONCURRENT_JOBS=3
PORT=8000
```

## 🐳 Docker Deployment

### Production Docker

```bash
# Build production image
docker build -f Dockerfile.production -t aeon-agent:latest .

# Run with environment file
docker run -d \
  --name aeon-agent \
  -p 8000:8000 \
  --env-file .env \
  --restart unless-stopped \
  aeon-agent:latest
```

### DigitalOcean Deployment

1. **Create Droplet:**
   - Ubuntu 22.04 LTS
   - 4GB RAM minimum (8GB recommended)
   - Install Docker

2. **Deploy with Docker Compose:**
```bash
# Copy files to server
scp -r . user@your-server:/opt/aeon-agent/

# SSH to server
ssh user@your-server
cd /opt/aeon-agent

# Create environment file
cp .env.example .env
# Edit .env with your values

# Deploy
docker-compose -f docker-compose.production.yml up -d
```

3. **Setup reverse proxy (optional):**
```nginx
# /etc/nginx/sites-available/aeon-agent
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /health {
        proxy_pass http://localhost:8000/health;
    }
}
```

## 🔧 Configuration

### Video Processing Settings

```python
# config.py
MAX_VIDEO_DURATION = 300  # 5 minutes
DEFAULT_FPS = 30
DEFAULT_RESOLUTION = "1080p"
VIDEO_CODEC = "libx264"
AUDIO_CODEC = "aac"
VIDEO_BITRATE = "2M"
AUDIO_BITRATE = "128k"
```

### Performance Tuning

- **MAX_CONCURRENT_JOBS**: Number of simultaneous video processing jobs
- **POLL_INTERVAL**: How often to check for new jobs (seconds)
- **Memory**: Recommend 4GB+ RAM for video processing
- **CPU**: Multi-core recommended for faster rendering

## 📊 Monitoring

### Health Checks

- `GET /health` - Basic health check
- `GET /status` - Detailed status with statistics

### Logging

- **Console**: Real-time logs to stdout
- **File**: Rotating log files in `/app/logs/`
- **Job Logs**: Individual logs per job ID

### Metrics

- Jobs processed
- Jobs failed
- Current active jobs
- Success rate
- Uptime

## 🧪 Testing

### Unit Tests

```bash
# Run tests
python -m pytest tests/

# With coverage
python -m pytest tests/ --cov=src/
```

### Integration Test

```bash
# Test job round-trip
python test_job_flow.py
```

### Load Testing

```bash
# Simulate multiple jobs
python load_test.py --jobs 10 --concurrent 3
```

## 🔒 Security

- **Environment Variables**: All secrets in environment
- **RLS Policies**: Database access controlled by Supabase RLS
- **File Cleanup**: Temporary files automatically cleaned
- **Input Validation**: All job data validated before processing
- **Resource Limits**: Memory and CPU limits in Docker

## 🐛 Troubleshooting

### Common Issues

1. **Agent not picking up jobs:**
   - Check Supabase connection
   - Verify RLS policies allow service role access
   - Check agent logs for errors

2. **Video processing fails:**
   - Ensure FFMPEG is installed
   - Check available disk space
   - Verify memory limits

3. **Upload failures:**
   - Check Vercel Blob token
   - Verify network connectivity
   - Check file size limits

4. **High memory usage:**
   - Reduce MAX_CONCURRENT_JOBS
   - Ensure video cleanup is working
   - Monitor for memory leaks

### Debug Mode

Set `LOG_LEVEL=DEBUG` for detailed logging:

```bash
export LOG_LEVEL=DEBUG
python main.py
```

## 📄 License

Proprietary - AEON Platform
