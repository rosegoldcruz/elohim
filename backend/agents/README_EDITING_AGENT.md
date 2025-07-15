# 🎬 AEON Production-Grade Python Editing Agent

## Overview

The AEON Editing Agent is a production-ready Python module that processes video clips into viral TikTok content using advanced editing techniques, GPU acceleration, and AI-powered transitions.

## 🚀 Features

- **GPU-Accelerated Transitions**: GLSL shader support for smooth effects
- **Beat-Synced Editing**: Automatic beat detection with Librosa
- **Viral TikTok Styles**: Bounce, typewriter, and highlight captions
- **ASMR Layers**: Trigger sounds for enhanced engagement
- **Velocity Editing**: Progressive cut frequency for retention
- **First-Frame Hook**: Freeze-frame attention grabbers
- **TikTok Optimization**: Vertical format, 60 FPS, compressed output

## 📦 Installation

```bash
# Install required dependencies
pip install moviepy librosa pydub opencv-python pydantic numpy

# For GPU acceleration (optional)
pip install ffmpeg-python
```

## 📋 EditingPlan JSON Schema

The agent processes videos based on a JSON editing plan:

```json
{
  "clips": ["clip1.mp4", "clip2.mp4", "clip3.mp4"],
  "transitions": [
    {
      "type": "zoom_punch",
      "duration": 0.3,
      "beat_synced": true,
      "intensity": 0.8
    },
    {
      "type": "glitch_blast",
      "duration": 0.2,
      "intensity": 0.6,
      "glsl_code": "// Custom GLSL shader code"
    }
  ],
  "captions": [
    {
      "text": "VIRAL CONTENT!",
      "start_time": 0.5,
      "end_time": 2.0,
      "style": "bounce",
      "position": [0.5, 0.1]
    }
  ],
  "sfx": [
    {
      "file": "assets/swoosh.mp3",
      "start_time": 1.0,
      "volume": 0.8
    }
  ],
  "beatSync": {
    "enabled": true,
    "audio_file": "background_music.mp3",
    "sensitivity": 0.7
  },
  "asmrLayers": [
    {
      "type": "paper_rustle",
      "timing": "pre_transition",
      "volume": 0.3
    }
  ],
  "velocityEditing": {
    "enabled": true,
    "start_cut_duration": 1.5,
    "end_cut_duration": 0.3
  },
  "firstFrameHook": {
    "enabled": true,
    "freeze_duration": 0.5,
    "text": "STOP SCROLLING!"
  }
}
```

## 🎯 Usage Examples

### Basic Usage

```python
from agents.editing_agent import EditingAgent

# Initialize with editing plan
agent = EditingAgent("editing_plan.json")

# Process and render video
output_file = agent.process("output/my_viral_video.mp4")
print(f"Video saved to: {output_file}")
```

### Command Line Usage

```bash
# Process with default settings
python agents/editing_agent.py --plan editing_plan.json

# Custom output path
python agents/editing_agent.py --plan editing_plan.json --output custom/path.mp4
```

### Advanced Usage

```python
import json
from agents.editing_agent import EditingAgent, EditingPlanModel

# Create editing plan programmatically
plan_data = {
    "clips": ["scene1.mp4", "scene2.mp4"],
    "transitions": [
        {
            "type": "zoom_punch",
            "duration": 0.3,
            "intensity": 0.9
        }
    ],
    "captions": [
        {
            "text": "AI IS CHANGING EVERYTHING!",
            "start_time": 0.0,
            "end_time": 2.0,
            "style": "bounce"
        }
    ],
    "firstFrameHook": {
        "enabled": True,
        "freeze_duration": 0.8,
        "text": "WATCH THIS!"
    }
}

# Save plan and process
with open("dynamic_plan.json", "w") as f:
    json.dump(plan_data, f, indent=2)

agent = EditingAgent("dynamic_plan.json")
result = agent.process("viral_output.mp4")
```

## 🎨 Transition Types

### 1. Zoom Punch (`zoom_punch`)
- Viral zoom effect with intensity control
- Perfect for emphasis and attention-grabbing moments

### 2. Glitch Blast (`glitch_blast`)
- Digital glitch effect with color separation
- Great for tech/AI content and modern aesthetics

### 3. Velocity Wipe (`velocity_wipe`)
- Fast crossfade for rapid-fire editing
- Maintains high energy and pacing

### 4. AI Generated (`ai_generated`)
- Custom GLSL shader transitions
- Supports GPU acceleration for complex effects

## 📝 Caption Styles

### Bounce Style
```python
# Animated bouncing text
{
    "text": "VIRAL MOMENT!",
    "style": "bounce",
    "start_time": 1.0
}
```

### Typewriter Style
```python
# Character-by-character reveal
{
    "text": "This changes everything...",
    "style": "typewriter",
    "start_time": 2.0,
    "end_time": 4.0
}
```

### Highlight Style
```python
# Background highlighted text
{
    "text": "IMPORTANT!",
    "style": "highlight",
    "start_time": 3.0
}
```

## 🔊 ASMR Integration

The agent supports ASMR trigger sounds for enhanced engagement:

- **paper_rustle**: Satisfying paper sounds
- **click**: Sharp click sounds for transitions
- **swoosh**: Smooth whoosh effects

```json
{
  "asmrLayers": [
    {
      "type": "paper_rustle",
      "timing": "pre_transition",
      "volume": 0.3
    }
  ]
}
```

## ⚡ Performance Optimization

### GPU Acceleration
- GLSL shader support for transitions
- FFmpeg GPU encoding when available
- Optimized memory management

### TikTok Optimization
- Vertical 9:16 aspect ratio
- 60 FPS for smooth playback
- Compressed output for fast uploads
- Web-optimized encoding

## 🛠️ File Structure

```
agents/
├── editing_agent.py          # Main EditingAgent class
├── README_EDITING_AGENT.md   # This documentation
└── assets/                   # ASMR sounds and resources
    └── asmr/
        ├── paper_rustle.mp3
        ├── click.mp3
        └── swoosh.mp3
```

## 🔧 Configuration

### Environment Variables
```bash
# Optional: FFmpeg path for GPU acceleration
export FFMPEG_BINARY="/usr/local/bin/ffmpeg"

# Optional: Enable GPU processing
export MOVIEPY_GPU=1
```

### Dependencies
- **MoviePy**: Video processing and editing
- **Librosa**: Audio analysis and beat detection
- **OpenCV**: Image processing and effects
- **Pydantic**: Schema validation
- **NumPy**: Numerical operations
- **Pydub**: Audio manipulation

## 🎯 Best Practices

1. **Clip Preparation**: Ensure clips are in compatible formats (MP4, MOV)
2. **Audio Quality**: Use high-quality audio files for beat detection
3. **Memory Management**: Process shorter clips for better performance
4. **GPU Usage**: Enable GPU acceleration for complex transitions
5. **Testing**: Validate editing plans before processing

## 🚨 Troubleshooting

### Common Issues

**Import Errors**: Install missing dependencies
```bash
pip install moviepy librosa pydub opencv-python pydantic
```

**Memory Issues**: Reduce clip resolution or duration
```python
# Resize clips before processing
clip = clip.resize(height=720)
```

**Audio Sync Issues**: Check audio file format and sample rate
```python
# Convert audio to compatible format
librosa.load(audio_file, sr=22050)
```

## 📊 Output Specifications

- **Format**: MP4 (H.264/AAC)
- **Resolution**: 1080x1920 (TikTok vertical)
- **Frame Rate**: 60 FPS
- **Bitrate**: Optimized for quality/size balance
- **Audio**: AAC 44.1kHz stereo

## 🎉 Example Output

The agent produces TikTok-ready videos with:
- Viral transitions and effects
- Beat-synced cuts and timing
- Engaging captions and text overlays
- ASMR trigger sounds
- First-frame hooks for attention
- Optimized encoding for social media

Perfect for content creators, marketers, and anyone looking to create viral TikTok content with professional editing techniques!
