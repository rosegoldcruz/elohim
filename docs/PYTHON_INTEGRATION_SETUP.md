# 🐍 AEON Python Pipeline Integration

Complete guide to integrate the Python video processing pipeline with your AEON React platform.

## 🎯 **What This Integration Provides**

Your AEON platform now has **dual rendering engines**:

1. **React/TypeScript Frontend**: Professional UI with real-time previews
2. **Python Backend**: High-performance video processing with MoviePy + Librosa

### **Capabilities**
- ✅ **6-scene video compilation** with professional transitions
- ✅ **Beat-synchronized editing** using Librosa audio analysis
- ✅ **GPU acceleration** with h264_nvenc (4x faster)
- ✅ **Viral effects**: Zoom punch, glitch blast, hook freeze
- ✅ **TTS voiceover** with Google Text-to-Speech
- ✅ **Real-time progress tracking** from React interface

## 🛠️ **Installation & Setup**

### 1. Install Python Dependencies

```bash
# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required packages
pip install moviepy librosa gtts numpy scipy
```

### 2. Verify FFmpeg with GPU Support

```bash
# Check if NVENC is available
ffmpeg -encoders | grep nvenc

# Expected output:
# V..... h264_nvenc         NVIDIA NVENC H.264 encoder
# V..... hevc_nvenc         NVIDIA NVENC H.265 encoder
```

### 3. Test Python Pipeline

```bash
# Create test directory structure
mkdir -p scenes voiceover output

# Add sample script
echo "Welcome to AEON! This is an amazing video creation platform that will revolutionize how you make content." > voiceover/script.txt

# Run the pipeline (requires sample videos in scenes/)
python python/aeon_pipeline.py
```

## 🚀 **How It Works**

### **Frontend → Backend Flow**

1. **User creates project** in React interface
2. **Selects scenes** using drag-and-drop timeline
3. **Writes voiceover script** in Python render panel
4. **Configures options** (GPU, beat sync, viral mode)
5. **Clicks "Start Render"** → triggers Python pipeline
6. **Real-time progress** updates via API polling
7. **Downloads final video** when complete

### **API Integration**

```typescript
// Frontend calls Python pipeline
const response = await fetch('/api/python/render', {
  method: 'POST',
  body: JSON.stringify({
    scenes: selectedScenes,
    voiceoverScript: userScript,
    options: {
      useGPU: true,
      enableBeatSync: true,
      viralMode: true,
      outputFormat: '1080x1920'
    }
  })
});
```

### **Python Processing**

```python
# Python pipeline processes:
1. Downloads scene videos from URLs
2. Generates TTS from script
3. Detects beats using Librosa
4. Applies viral transitions (zoom punch, glitch)
5. Syncs transitions to beat markers
6. Renders with GPU acceleration
7. Uploads final video to storage
```

## 🎬 **Features Breakdown**

### **Viral Transitions**
- **Scene 1**: Hook freeze with "WATCH THIS! 🔥"
- **Scenes 2,4,6**: Zoom punch transitions
- **Scenes 3,5**: Glitch blast effects
- **All scenes**: Professional fade in/out

### **Beat Synchronization**
```python
# Librosa analyzes audio and finds optimal transition points
beats, bpm = librosa.beat.beat_track(y=audio, sr=sample_rate)
transition_points = sync_transitions_to_beats(beats, scene_durations)
```

### **GPU Acceleration**
```python
# Automatic GPU detection and fallback
codec = "h264_nvenc" if gpu_available else "libx264"
export_params = {
    "codec": codec,
    "preset": "fast" if gpu else "medium",
    "ffmpeg_params": ["-crf", "23", "-gpu", "0"] if gpu else []
}
```

## 🔧 **Configuration Options**

### **Environment Variables**
```env
# Add to your .env.local
PYTHON_PIPELINE_ENABLED=true
PYTHON_EXECUTABLE=python
TEMP_STORAGE_PATH=/tmp/aeon_renders
MAX_CONCURRENT_PYTHON_JOBS=2
```

### **Render Options**
- **GPU Acceleration**: 4x faster encoding with NVENC
- **Beat Synchronization**: Auto-sync transitions to audio beats
- **Viral Mode**: Apply engagement-optimized effects
- **Output Formats**: TikTok (9:16), Instagram (1:1), YouTube (16:9)

## 📊 **Performance Comparison**

| Feature | React WebGL | Python Pipeline |
|---------|-------------|-----------------|
| **Real-time Preview** | ✅ Instant | ❌ Render required |
| **Final Quality** | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent |
| **Processing Speed** | ⭐⭐ Moderate | ⭐⭐⭐⭐ Very Fast |
| **Effects Library** | 50+ transitions | Viral-optimized |
| **Audio Sync** | Manual | Auto beat detection |
| **GPU Acceleration** | WebGL only | Full NVENC support |

## 🎯 **Usage Examples**

### **Basic Render**
```typescript
// In your React component
const handlePythonRender = () => {
  setPythonRenderOpen(true);
  // User configures options and starts render
};
```

### **Advanced Configuration**
```python
# Custom Python pipeline settings
build_pipeline(
    use_gpu=True,           # Enable NVENC
    enable_beat_sync=True,  # Sync to audio beats
    viral_mode=True,        # Apply viral effects
    output_format="1080x1920"  # TikTok format
)
```

### **Progress Monitoring**
```typescript
// Real-time job status updates
const pollJobStatus = async (jobId: string) => {
  const response = await fetch(`/api/python/render?jobId=${jobId}`);
  const { progress, status, outputUrl } = await response.json();
  
  if (status === 'completed') {
    // Download video
    window.open(outputUrl);
  }
};
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### 1. "Python not found"
```bash
# Ensure Python is in PATH
which python  # Linux/Mac
where python  # Windows

# Or specify full path in .env
PYTHON_EXECUTABLE=/usr/bin/python3
```

#### 2. "MoviePy import error"
```bash
# Reinstall with all dependencies
pip uninstall moviepy
pip install moviepy[optional]
```

#### 3. "NVENC not available"
```bash
# Check GPU drivers
nvidia-smi

# Verify FFmpeg NVENC support
ffmpeg -encoders | grep nvenc
```

#### 4. "Librosa installation failed"
```bash
# Install system dependencies first
# Ubuntu/Debian:
sudo apt-get install libsndfile1

# macOS:
brew install libsndfile

# Then reinstall
pip install librosa
```

## 🔮 **Advanced Features**

### **Custom Transitions**
Add your own transition effects to the Python pipeline:

```python
def custom_transition(clip, **params):
    def effect(get_frame, t):
        # Your custom transition logic
        return modified_frame
    return clip.fl(effect)
```

### **Batch Processing**
Process multiple projects simultaneously:

```python
# Queue multiple render jobs
for project in projects:
    job_id = start_python_render(project)
    monitor_job(job_id)
```

### **Cloud Deployment**
Deploy Python pipeline to cloud for scalability:

```yaml
# docker-compose.yml
services:
  python-renderer:
    build: ./python
    environment:
      - GPU_ENABLED=true
    volumes:
      - ./temp:/app/temp
```

## ✅ **Verification Checklist**

- [ ] Python dependencies installed
- [ ] FFmpeg with NVENC support
- [ ] Sample videos in `scenes/` directory
- [ ] Voiceover script created
- [ ] GPU acceleration tested
- [ ] API endpoints responding
- [ ] React integration working
- [ ] Progress tracking functional
- [ ] Video download working

## 🎉 **You're Ready!**

Your AEON platform now has **professional-grade Python video processing** integrated with your **React interface**!

**Key Benefits:**
- 🚀 **4x faster rendering** with GPU acceleration
- 🎵 **Beat-synchronized editing** for viral content
- 🎬 **Professional transitions** and effects
- 📱 **Multi-platform output** (TikTok, Instagram, YouTube)
- 🔄 **Real-time progress** tracking from React UI

**Start creating viral videos with the power of Python + React!** 🎬✨
