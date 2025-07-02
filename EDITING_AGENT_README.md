# 🎬 AEON EditingAgent - Production-Grade Video Editing

A robust, TypeScript-based video editing agent built for Next.js 14 using Node.js `child_process` and FFmpeg. No Python dependencies, pure Node.js implementation.

## 🚀 Features

- **✅ Production-Ready**: Built with TypeScript, comprehensive error handling
- **✅ FFmpeg Integration**: Direct `child_process` execution, no external dependencies
- **✅ Multiple Aspect Ratios**: 9:16 (TikTok), 1:1 (Instagram), 16:9 (YouTube)
- **✅ Advanced Transitions**: Crossfade, cut, slide transitions between clips
- **✅ Audio Mixing**: Background music with video audio balancing
- **✅ Visual Overlays**: Avatar overlays, text watermarks, captions
- **✅ Fade Effects**: Configurable fade in/out for first and last clips
- **✅ Vercel Blob Integration**: Automatic upload and public URL generation
- **✅ Robust Validation**: Input validation and comprehensive error handling

## 📋 Interface Definition

```typescript
export interface EditingRequest {
  videoClips: string[];                    // Required: Array of video URLs
  scenePlan?: any;                         // Optional: Scene metadata for captions
  bgmUrl?: string;                         // Optional: Background music URL
  avatarOverlayUrl?: string;               // Optional: Avatar overlay (PNG/video)
  transitions: 'crossfade' | 'cut' | 'slide'; // Required: Transition style
  fadeInOut: boolean;                      // Required: Add fade effects
  watermarkText?: string;                  // Optional: Text watermark
  addCaptions?: boolean;                   // Optional: Add basic captions
  aspectRatio?: '9:16' | '1:1' | '16:9';   // Optional: Output aspect ratio
}
```

## 🎯 Quick Start

### Basic Usage

```typescript
import { EditingAgent } from '@/lib/agents/editing-agent';

const editingAgent = new EditingAgent();

const request = {
  videoClips: [
    'https://example.com/clip1.mp4',
    'https://example.com/clip2.mp4'
  ],
  transitions: 'crossfade',
  fadeInOut: true,
  aspectRatio: '16:9'
};

const finalVideoUrl = await editingAgent.editVideo(request);
console.log('Final video:', finalVideoUrl);
```

### Advanced Usage with All Features

```typescript
const advancedRequest = {
  videoClips: [
    'https://example.com/scene1.mp4',
    'https://example.com/scene2.mp4',
    'https://example.com/scene3.mp4'
  ],
  bgmUrl: 'https://example.com/background-music.mp3',
  avatarOverlayUrl: 'https://example.com/avatar.png',
  transitions: 'slide',
  fadeInOut: true,
  watermarkText: '🧠 AEON AI',
  addCaptions: true,
  aspectRatio: '9:16',
  scenePlan: {
    scenes: [
      { narration: 'Welcome to AEON video generation!' }
    ]
  }
};

const result = await editingAgent.editVideo(advancedRequest);
```

## 📡 API Endpoint

### POST /api/agents/editing

**Request Body:**
```json
{
  "videoClips": [
    "https://example.com/clip1.mp4",
    "https://example.com/clip2.mp4"
  ],
  "bgmUrl": "https://example.com/music.mp3",
  "avatarOverlayUrl": "https://example.com/avatar.png",
  "transitions": "crossfade",
  "fadeInOut": true,
  "watermarkText": "🧠 AEON AI",
  "addCaptions": true,
  "aspectRatio": "9:16"
}
```

**Response:**
```json
{
  "success": true,
  "final_video_url": "https://blob.vercel-storage.com/aeon-final-123456.mp4",
  "metadata": {
    "clips_processed": 2,
    "transitions": "crossfade",
    "aspect_ratio": "9:16",
    "has_bgm": true,
    "has_avatar": true,
    "has_captions": true,
    "has_watermark": true
  }
}
```

### GET /api/agents/editing?action=capabilities

**Response:**
```json
{
  "capabilities": {
    "maxClips": 20,
    "supportedTransitions": ["crossfade", "cut", "slide"],
    "supportedAspectRatios": ["9:16", "1:1", "16:9"],
    "features": [
      "Video concatenation with transitions",
      "Background music mixing",
      "Avatar overlays",
      "Text watermarks",
      "Basic captions via drawtext",
      "Fade in/out effects",
      "Multiple aspect ratios",
      "H.264 encoding with fast start"
    ]
  }
}
```

## 🔧 FFmpeg Filter Chain

The EditingAgent dynamically builds complex FFmpeg filter chains:

### Basic Concatenation with Crossfade
```bash
ffmpeg -i clip1.mp4 -i clip2.mp4 \
-filter_complex "[0:v]scale=1920:1080,setsar=1[v0];[1:v]scale=1920:1080,setsar=1[v1];[v0][v1]xfade=transition=fade:duration=0.5:offset=5[vout];[0:a][1:a]amix=inputs=2:duration=shortest[aout]" \
-map "[vout]" -map "[aout]" \
-c:v libx264 -pix_fmt yuv420p -r 30 -s 1920x1080 \
-c:a aac -b:a 128k -shortest -movflags +faststart \
output.mp4
```

### With BGM and Avatar Overlay
```bash
ffmpeg -i clip1.mp4 -i bgm.mp3 -i avatar.png \
-filter_complex "[0:v]scale=1920:1080,setsar=1[v0];[v0][2:v]overlay=W-w-30:30[vout];[0:a][1:a]amix=inputs=2:weights=0.8 0.3:duration=shortest[aout]" \
-map "[vout]" -map "[aout]" \
-c:v libx264 -pix_fmt yuv420p -r 30 -s 1920x1080 \
-c:a aac -b:a 128k -shortest -movflags +faststart \
output.mp4
```

## 🎨 Aspect Ratio Configurations

| Aspect Ratio | Resolution | Use Case |
|--------------|------------|----------|
| `9:16` | 1080x1920 | TikTok, Instagram Stories, YouTube Shorts |
| `1:1` | 1080x1080 | Instagram Posts, Facebook Posts |
| `16:9` | 1920x1080 | YouTube, Landscape videos |

## 🎬 Transition Types

### Crossfade
- **Effect**: Smooth fade between clips
- **Duration**: 0.5 seconds
- **Best for**: Cinematic transitions, smooth flow

### Cut
- **Effect**: Direct concatenation, no overlap
- **Duration**: Instant
- **Best for**: Fast-paced content, quick cuts

### Slide
- **Effect**: Slide transition (slideright)
- **Duration**: 0.3 seconds
- **Best for**: Dynamic content, presentations

## 🔊 Audio Mixing

The EditingAgent handles complex audio scenarios:

- **Video Only**: Mixes audio from all video clips
- **BGM Only**: Uses background music as sole audio track
- **Video + BGM**: Mixes video audio (80%) with BGM (30%)
- **No Audio**: Creates silent stereo track

## 📁 File Management

### Download Process
1. **Validation**: HTTP 200 status check
2. **Storage**: Saves to `./temp/editing/`
3. **Verification**: Confirms non-zero file size

### Upload Process
1. **Processing**: FFmpeg execution with validation
2. **Upload**: Vercel Blob with public access
3. **Cleanup**: Automatic temp file removal

## ⚠️ Error Handling

### Input Validation
- Minimum 1 video clip required
- Maximum 20 video clips allowed
- Valid transition types only
- Valid aspect ratios only

### Processing Errors
- Download failures with retry logic
- FFmpeg execution errors with detailed logging
- Upload failures with fallback options
- Automatic cleanup on errors

## 🧪 Testing

### Run Test Suite
```bash
node scripts/test-editing-agent.js
```

### Manual API Testing
```bash
# Start development server
pnpm dev

# Test basic editing
curl -X POST http://localhost:3000/api/agents/editing \
  -H "Content-Type: application/json" \
  -d '{
    "videoClips": ["https://example.com/clip1.mp4"],
    "transitions": "cut",
    "fadeInOut": false,
    "aspectRatio": "16:9"
  }'

# Get capabilities
curl http://localhost:3000/api/agents/editing?action=capabilities
```

## 🚀 Production Deployment

### Environment Requirements
- **Node.js**: 18+ with child_process support
- **FFmpeg**: Installed and accessible in PATH
- **Memory**: 2GB+ recommended for video processing
- **Storage**: Temp directory write permissions

### Vercel Configuration
```json
{
  "functions": {
    "app/api/agents/editing/route.ts": {
      "maxDuration": 300
    }
  }
}
```

### Performance Optimization
- **Parallel Downloads**: Concurrent file fetching
- **Stream Processing**: Memory-efficient video handling
- **Cleanup**: Automatic temp file management
- **Caching**: Reuse downloaded assets when possible

## 📊 Limitations

- **Max Clips**: 20 video clips per request
- **File Size**: Limited by available memory and timeout
- **Processing Time**: 5-minute timeout on Vercel
- **Formats**: Input videos must be FFmpeg-compatible

## 🔮 Future Enhancements

- **Advanced Transitions**: More transition effects
- **Color Grading**: Automatic color correction
- **Audio Enhancement**: Noise reduction, normalization
- **Batch Processing**: Multiple video requests
- **Real-time Preview**: Progress streaming
- **Custom Filters**: User-defined FFmpeg filters

---

**Built for AEON Platform**  
*Production-Ready • TypeScript • FFmpeg-Powered*
