# 🚀 AEON Viral Python Editing Agent

**Production-grade, GPU-accelerated, FastAPI Python agent for TikTok/shorts editing—blessed for virality, robustness, modularity, and scalability.**

## ✨ Features

### 🎬 Viral Video Editing
- **GPU-accelerated processing** with CUDA support
- **TikTok-optimized transitions** (zoom punch, glitch, 3D flip, viral cuts)
- **Beat synchronization** with Librosa audio analysis
- **Kinetic captions** with bouncing/typewriter animations
- **ASMR sound layers** and trending SFX integration
- **First-frame hooks** and velocity editing for maximum engagement
- **Viral psychological triggers** and attention retention

### 🔧 Technical Stack
- **FastAPI** - High-performance async web framework
- **MoviePy** - Professional video editing capabilities
- **OpenCV** - Advanced computer vision and effects
- **Librosa** - Audio analysis and beat detection
- **Pydub** - Audio processing and mixing
- **CUDA** - GPU acceleration for real-time processing

### 🎯 Viral Optimization
- **TikTok algorithm optimization** with proven engagement tactics
- **Mobile-first design** with aspect ratio intelligence
- **Platform-specific optimization** (TikTok, Instagram, YouTube)
- **Viral score calculation** based on applied features
- **Content type presets** (dance, tutorial, comedy, lifestyle, gaming)

## 🚀 Quick Start

### Docker Deployment (Recommended)

```bash
# Build the container
docker build -t aeon-editor-agent:latest .

# Run with GPU support
docker run --gpus all -p 8080:8080 aeon-editor-agent:latest

# Access the API
curl http://localhost:8080/health
```

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Start the server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload

# API documentation
open http://localhost:8080/docs
```

## 📡 API Endpoints

### Main Editing Endpoint
```http
POST /edit
```

**Parameters:**
- `project_name` (string) - Project name for output file
- `video_clips` (files) - Video clips to edit (MP4 format)
- `transitions` (string) - Transition type: `zoom_punch`, `glitch`, `slide`, `3d_flip`, `viral_cut`
- `fade_in_out` (bool) - Apply fade in/out effects
- `bgm` (file, optional) - Background music (MP3/WAV)
- `avatar_overlay` (file, optional) - Avatar/logo overlay (PNG)
- `watermark_text` (string) - Watermark text to overlay
- `aspect_ratio` (string) - Aspect ratio: `9:16`, `16:9`, `1:1`
- `captions` (file, optional) - Captions file (SRT format)
- `viral_mode` (bool) - Enable viral TikTok optimizations
- `beat_sync` (bool) - Sync cuts to audio beats
- `velocity_editing` (bool) - Progressive velocity editing
- `asmr_layer` (bool) - Add ASMR sound effects
- `kinetic_captions` (bool) - Bouncing/kinetic caption animations
- `first_frame_hook` (bool) - First frame freeze hook
- `quality` (string) - Output quality: `low`, `medium`, `high`, `ultra`

### Quick Preview
```http
POST /preview
```

Generate a 15-second preview with basic transitions.

### Available Transitions
```http
POST /transitions
```

Get list of available viral transitions with descriptions.

### Health Check
```http
GET /health
```

Service health and status information.

## 🎨 Usage Examples

### Basic Viral Edit
```python
import requests

files = {
    'video_clips': [
        open('clip1.mp4', 'rb'),
        open('clip2.mp4', 'rb'),
        open('clip3.mp4', 'rb')
    ],
    'bgm': open('trending_song.mp3', 'rb')
}

data = {
    'project_name': 'my_viral_video',
    'transitions': 'zoom_punch',
    'aspect_ratio': '9:16',
    'viral_mode': True,
    'beat_sync': True,
    'quality': 'high'
}

response = requests.post('http://localhost:8080/edit', files=files, data=data)

with open('final_video.mp4', 'wb') as f:
    f.write(response.content)
```

### TikTok Dance Video
```python
data = {
    'project_name': 'tiktok_dance',
    'transitions': 'viral_cut',
    'aspect_ratio': '9:16',
    'viral_mode': True,
    'beat_sync': True,
    'velocity_editing': True,
    'first_frame_hook': True,
    'kinetic_captions': True,
    'quality': 'high'
}
```

### Tutorial Video
```python
data = {
    'project_name': 'tutorial',
    'transitions': 'slide',
    'aspect_ratio': '16:9',
    'viral_mode': True,
    'beat_sync': False,
    'velocity_editing': False,
    'asmr_layer': True,
    'kinetic_captions': True,
    'watermark_text': 'Tutorial by @creator',
    'quality': 'ultra'
}
```

## 🔧 Integration with Next.js/Node.js

### API Client Example
```typescript
// lib/aeon-editor-client.ts
export class AeonEditorClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  async editVideo(config: EditConfig): Promise<Blob> {
    const formData = new FormData();
    
    // Add video clips
    config.clips.forEach((clip, index) => {
      formData.append('video_clips', clip, `clip_${index}.mp4`);
    });
    
    // Add configuration
    Object.entries(config).forEach(([key, value]) => {
      if (key !== 'clips') {
        formData.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}/edit`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Edit failed: ${response.statusText}`);
    }

    return response.blob();
  }

  async generatePreview(clips: File[]): Promise<Blob> {
    const formData = new FormData();
    clips.forEach((clip, index) => {
      formData.append('video_clips', clip, `clip_${index}.mp4`);
    });

    const response = await fetch(`${this.baseUrl}/preview`, {
      method: 'POST',
      body: formData,
    });

    return response.blob();
  }
}
```

### React Hook
```typescript
// hooks/useAeonEditor.ts
import { useState } from 'react';
import { AeonEditorClient } from '@/lib/aeon-editor-client';

export function useAeonEditor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = new AeonEditorClient();

  const editVideo = async (config: EditConfig) => {
    setLoading(true);
    setError(null);

    try {
      const result = await client.editVideo(config);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { editVideo, loading, error };
}
```

## 🎯 Viral Presets

### Content Type Presets
```python
VIRAL_PRESETS = {
    "tiktok_dance": {
        "transitions": "viral_cut",
        "beat_sync": True,
        "velocity_editing": True,
        "first_frame_hook": True,
        "viral_mode": True
    },
    "tutorial": {
        "transitions": "slide",
        "asmr_layer": True,
        "kinetic_captions": True,
        "viral_mode": True
    },
    "comedy": {
        "transitions": "zoom_punch",
        "beat_sync": True,
        "velocity_editing": True,
        "viral_mode": True
    }
}
```

## 🔥 Viral Features Explained

### 🎣 First Frame Hook
- Freezes first frame with attention-grabbing text
- Psychological triggers: "Wait for it...", "You won't believe this..."
- Zoom and pulse effects for maximum impact

### ⚡ Velocity Editing
- Progressive speed increases throughout video
- Maintains viewer attention with escalating energy
- Algorithm-optimized pacing

### 🎵 Beat Synchronization
- Analyzes audio with Librosa for beat detection
- Syncs cuts and transitions to musical beats
- Automatic tempo-based speed adjustments

### 📝 Kinetic Captions
- Bouncing, typewriter, and zoom animations
- Word-by-word highlighting effects
- Mobile-optimized typography

### 🎧 ASMR Layers
- Subtle background sounds for engagement
- Paper rustling, typing, water drops
- Scientifically proven retention boosters

### 🔄 Viral Transitions
- **Zoom Punch**: Aggressive zoom with shake effects
- **Glitch**: Digital artifacts and RGB shifts
- **3D Flip**: Perspective transformation effects
- **Viral Cut**: Ultra-fast cuts with flash
- **Slide**: Smooth directional transitions

## 📊 Performance Metrics

### Viral Score Calculation
```python
def calculate_viral_score(config):
    score = 50  # Base score
    
    if config.get("viral_mode"): score += 20
    if config.get("beat_sync"): score += 15
    if config.get("velocity_editing"): score += 10
    if config.get("first_frame_hook"): score += 15
    if config.get("kinetic_captions"): score += 10
    
    return min(score, 100)
```

### Processing Performance
- **GPU Acceleration**: 5-10x faster than CPU-only
- **Parallel Processing**: Multiple clips processed simultaneously
- **Memory Optimization**: Efficient CUDA memory management
- **Real-time Preview**: Sub-second preview generation

## 🐳 Production Deployment

### Docker Compose
```yaml
version: '3.8'
services:
  aeon-editor:
    build: .
    ports:
      - "8080:8080"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    environment:
      - CUDA_VISIBLE_DEVICES=0
      - LOG_LEVEL=INFO
    volumes:
      - /tmp:/tmp
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aeon-editor-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: aeon-editor-agent
  template:
    spec:
      containers:
      - name: aeon-editor-agent
        image: aeon-editor-agent:latest
        resources:
          limits:
            nvidia.com/gpu: 1
            memory: "8Gi"
            cpu: "4"
```

## 🔧 Configuration

### Environment Variables
```bash
# GPU Configuration
CUDA_VISIBLE_DEVICES=0
CUDA_MEMORY_FRACTION=0.8

# Performance Tuning
OMP_NUM_THREADS=4
NUMBA_NUM_THREADS=4

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# FastAPI
FASTAPI_ENV=production
```

### Asset Management
```
assets/
├── fonts/           # Custom fonts for captions
├── sfx/            # Sound effects library
├── overlays/       # Logo and watermark assets
└── presets/        # Viral editing presets
```

## 🧪 Testing

```bash
# Run tests
pytest test/

# Test specific module
pytest test/test_transitions.py

# Performance testing
pytest test/test_performance.py --benchmark

# Integration testing
pytest test/test_integration.py
```

## 📈 Monitoring

### Health Checks
- `/health` - Service status
- `/metrics` - Prometheus metrics
- GPU memory usage monitoring
- Processing time tracking

### Logging
- Structured JSON logging
- Error tracking with Sentry
- Performance profiling
- Request/response logging

## 🔒 Security

- Non-root container execution
- Input validation and sanitization
- File type verification
- Resource limits and timeouts
- CORS configuration

## 🚀 Roadmap

- [ ] Real-time collaboration features
- [ ] Advanced AI-powered scene detection
- [ ] Voice synthesis integration
- [ ] Multi-language caption support
- [ ] Advanced color grading
- [ ] 3D effects and transitions
- [ ] Live streaming integration
- [ ] Mobile app SDK

## 📞 Support

For issues, feature requests, or integration support:
- GitHub Issues: [Create Issue](https://github.com/aeon/editor-agent/issues)
- Documentation: [Full Docs](https://docs.aeon.com/editor-agent)
- Discord: [AEON Community](https://discord.gg/aeon)

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**AEON Editor Agent - Blessed for viral domination. Deploy, test, and let the flywheel commence. 🚀**
