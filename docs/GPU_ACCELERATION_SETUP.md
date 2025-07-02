# 🚀 AEON GPU Acceleration Setup Guide

Complete guide to enable CUDA/NVENC GPU acceleration for 4x faster video processing in your AEON platform.

## 🔍 Quick Check

First, verify if your system supports GPU acceleration:

```bash
# Check if NVENC is available
ffmpeg -encoders | grep nvenc

# Expected output if supported:
# V..... h264_nvenc         NVIDIA NVENC H.264 encoder
# V..... hevc_nvenc         NVIDIA NVENC H.265 encoder
```

## 📋 Prerequisites

### Hardware Requirements
- **NVIDIA GPU** with NVENC support (GTX 1050+ or RTX series)
- **4GB+ VRAM** recommended (8GB+ for 4K content)
- **CUDA Compute Capability 3.0+**

### Software Requirements
- **NVIDIA Driver** 470.57.02+ (Linux) or 471.96+ (Windows)
- **CUDA Toolkit** 11.0+ (optional but recommended)
- **FFmpeg** with NVENC support

## 🛠️ Installation Steps

### 1. Install NVIDIA Drivers

#### Windows
```bash
# Download from NVIDIA website
# https://www.nvidia.com/drivers/
# Or use GeForce Experience for automatic updates
```

#### Linux (Ubuntu/Debian)
```bash
# Add NVIDIA repository
sudo apt update
sudo apt install nvidia-driver-525 nvidia-cuda-toolkit

# Verify installation
nvidia-smi
nvcc --version
```

### 2. Install FFmpeg with NVENC

#### Windows (using Chocolatey)
```bash
# Install FFmpeg with NVENC support
choco install ffmpeg-full

# Verify NVENC support
ffmpeg -encoders | grep nvenc
```

#### Linux (Ubuntu/Debian)
```bash
# Install FFmpeg with NVENC
sudo apt update
sudo apt install ffmpeg

# For latest version with full NVENC support
sudo add-apt-repository ppa:jonathonf/ffmpeg-4
sudo apt update
sudo apt install ffmpeg
```

#### macOS (using Homebrew)
```bash
# Note: NVENC not available on macOS
# Use VideoToolbox instead
brew install ffmpeg --with-videotoolbox
```

### 3. Verify GPU Setup

Run the AEON GPU status check:

```bash
# In your AEON platform
curl http://localhost:3000/api/system/check-nvenc
```

Or use the GPU Status Panel in the video editor interface.

## ⚙️ Configuration

### 1. Update Environment Variables

Add to your `.env.local`:

```env
# GPU Acceleration Settings
ENABLE_GPU_ACCELERATION=true
CUDA_VISIBLE_DEVICES=0
GPU_MEMORY_LIMIT=4096
MAX_CONCURRENT_GPU_JOBS=3

# FFmpeg Settings
FFMPEG_GPU_PRESET=fast
FFMPEG_CRF=23
FFMPEG_PIXEL_FORMAT=yuv420p
```

### 2. Configure GPU Engine

Update your GPU transition engine configuration:

```typescript
// lib/gpu-config.ts
export const gpuConfig = {
  enableCUDA: process.env.ENABLE_GPU_ACCELERATION === 'true',
  memoryLimit: parseInt(process.env.GPU_MEMORY_LIMIT || '4096'),
  maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_GPU_JOBS || '3'),
  cacheSize: 1024, // 1GB cache
};
```

## 🎯 Performance Optimization

### GPU Memory Recommendations

| VRAM | Resolution | Concurrent Jobs | Settings |
|------|------------|-----------------|----------|
| 4GB  | 1080p      | 2-3 jobs       | CRF 25, fast preset |
| 8GB  | 1080p/4K   | 3-4 jobs       | CRF 20, fast preset |
| 12GB+ | 4K         | 4+ jobs        | CRF 18, medium preset |

### Encoding Settings

#### High Performance (Fast)
```typescript
const fastSettings = {
  videoCodec: 'h264_nvenc',
  preset: 'fast',
  crf: 25,
  pixelFormat: 'yuv420p',
  extraParams: ['-gpu', '0', '-delay', '0']
};
```

#### High Quality (Slower)
```typescript
const qualitySettings = {
  videoCodec: 'h264_nvenc',
  preset: 'slow',
  crf: 20,
  pixelFormat: 'yuv420p',
  extraParams: ['-gpu', '0', '-spatial-aq', '1']
};
```

#### Balanced
```typescript
const balancedSettings = {
  videoCodec: 'h264_nvenc',
  preset: 'medium',
  crf: 23,
  pixelFormat: 'yuv420p',
  extraParams: ['-gpu', '0']
};
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "NVENC not found"
```bash
# Check GPU support
nvidia-smi

# Reinstall NVIDIA drivers
# Windows: Use DDU to clean install
# Linux: sudo apt purge nvidia-* && sudo apt install nvidia-driver-525
```

#### 2. "FFmpeg NVENC error"
```bash
# Check FFmpeg build
ffmpeg -version | grep nvenc

# Rebuild FFmpeg with NVENC
# Or install pre-built version with NVENC support
```

#### 3. "GPU memory error"
```bash
# Reduce concurrent jobs
export MAX_CONCURRENT_GPU_JOBS=1

# Lower resolution/quality
export FFMPEG_CRF=28
```

#### 4. "CUDA out of memory"
```bash
# Check GPU memory usage
nvidia-smi

# Reduce memory limit
export GPU_MEMORY_LIMIT=2048
```

### Performance Monitoring

Monitor GPU usage during encoding:

```bash
# Real-time GPU monitoring
watch -n 1 nvidia-smi

# Log GPU usage
nvidia-smi --query-gpu=timestamp,name,utilization.gpu,memory.used,memory.total --format=csv -l 1
```

## 📊 Benchmarks

### Expected Performance Gains

| Task | CPU (x264) | GPU (NVENC) | Speedup |
|------|------------|-------------|---------|
| 1080p Transition | 8-12s | 2-3s | 4x |
| 4K Transition | 30-45s | 8-12s | 4x |
| Batch Processing | 5min | 1.2min | 4x |

### Quality Comparison

| Setting | File Size | Quality | Speed |
|---------|-----------|---------|-------|
| x264 CRF 20 | 100% | Excellent | 1x |
| NVENC CRF 20 | 110% | Very Good | 4x |
| NVENC CRF 23 | 85% | Good | 4x |

## 🚀 Advanced Configuration

### Multi-GPU Setup

For systems with multiple GPUs:

```env
# Use specific GPU
CUDA_VISIBLE_DEVICES=0

# Load balance across GPUs
CUDA_VISIBLE_DEVICES=0,1
GPU_LOAD_BALANCE=true
```

### Custom NVENC Parameters

```typescript
const advancedNVENC = {
  videoCodec: 'h264_nvenc',
  preset: 'p4',           // p1-p7 (p1=fastest, p7=slowest)
  tune: 'hq',             // hq, ll, ull, lossless
  profile: 'high',        // baseline, main, high
  level: '4.1',           // H.264 level
  rc: 'vbr',              // cbr, vbr, cqp
  cq: 23,                 // Constant quality
  maxrate: '5M',          // Max bitrate
  bufsize: '10M',         // Buffer size
  spatial_aq: 1,          // Spatial AQ
  temporal_aq: 1,         // Temporal AQ
  gpu: 0,                 // GPU index
};
```

## ✅ Verification

### Test GPU Acceleration

1. **Open AEON Video Editor** at `/editor`
2. **Click "GPU Status"** button
3. **Run Performance Test**
4. **Verify 4x speedup** compared to CPU

### Expected Results

✅ **GPU Detected**: NVIDIA RTX 3080 (10GB VRAM)  
✅ **NVENC Support**: h264_nvenc, hevc_nvenc  
✅ **Performance**: 4x faster than CPU encoding  
✅ **Quality**: Comparable to x264 medium preset  

## 🎯 Next Steps

1. **Configure optimal settings** based on your GPU
2. **Test with sample videos** to verify performance
3. **Monitor GPU usage** during batch processing
4. **Adjust concurrent jobs** based on VRAM availability

---

**🚀 Ready to accelerate your video editing workflow!**

For support, check the [AEON Documentation](../README.md) or open an issue on GitHub.
