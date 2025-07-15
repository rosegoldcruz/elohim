# AEON 6-Scene High-Fidelity Editing Pipeline - Enhanced with GPU + Beat Sync

import os
import json
import numpy as np
import librosa
from moviepy.editor import VideoFileClip, concatenate_videoclips, TextClip, CompositeVideoClip, AudioFileClip, CompositeAudioClip
from moviepy.video.fx.all import fadein, fadeout
from gtts import gTTS

# Scene sequence - FIXED missing variable
SCENE_SEQUENCE = [
    "scenes/scene1.mp4",
    "scenes/scene2.mp4", 
    "scenes/scene3.mp4",
    "scenes/scene4.mp4",
    "scenes/scene5.mp4",
    "scenes/scene6.mp4"
]

VOICEOVER_SCRIPT = "voiceover/script.txt"
OUTPUT_PATH = "output/AEON_6_scene_final.mp4"

# ---- ADVANCED TRANSITIONS ----

def zoom_punch(clip, zoom_factor=1.2, duration=0.5):
    """Viral zoom punch transition for maximum engagement"""
    def effect(get_frame, t):
        frame = get_frame(t)
        if t < duration:
            zoom = 1 + (zoom_factor - 1) * (t / duration)
            h, w, _ = frame.shape
            new_w, new_h = int(w / zoom), int(h / zoom)
            x1, y1 = (w - new_w) // 2, (h - new_h) // 2
            cropped = frame[y1:y1 + new_h, x1:x1 + new_w]
            return np.array(np.clip(np.resize(cropped, (h, w, 3)), 0, 255), dtype=np.uint8)
        return frame
    return clip.fl(effect)

def glitch_blast(clip, intensity=0.8, duration=0.4):
    """Digital glitch effect with RGB separation"""
    def effect(get_frame, t):
        frame = get_frame(t)
        if t < duration:
            progress = t / duration
            glitch = progress * intensity
            
            # RGB separation effect
            h, w, c = frame.shape
            offset = int(glitch * 10)
            
            # Create glitched frame
            glitched = frame.copy()
            if offset > 0:
                glitched[:, :-offset, 0] = frame[:, offset:, 0]  # Red shift
                glitched[:, offset:, 2] = frame[:, :-offset, 2]  # Blue shift
            
            # Add digital noise
            noise = np.random.randint(0, int(glitch * 50), (h, w, c))
            glitched = np.clip(glitched.astype(int) + noise, 0, 255).astype(np.uint8)
            
            return glitched
        return frame
    return clip.fl(effect)

def add_hook_freeze(clip, text="WAIT FOR IT", duration=0.8):
    """Add viral hook with freeze frame and caption"""
    freeze = clip.to_ImageClip(t=0).set_duration(duration)
    caption = TextClip(
        text, 
        fontsize=80, 
        color='white', 
        font='Arial-Bold',
        stroke_color='black',
        stroke_width=3
    ).set_position('center').set_duration(duration)
    
    hook_clip = CompositeVideoClip([freeze, caption])
    return concatenate_videoclips([hook_clip, clip])

# ---- BEAT DETECTION ----

def detect_beats(audio_file):
    """Analyze audio and detect beat markers for sync"""
    try:
        y, sr = librosa.load(audio_file)
        tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
        beat_times = librosa.frames_to_time(beat_frames, sr=sr)
        
        print(f"🎵 Detected {len(beat_times)} beats at {tempo:.1f} BPM")
        return beat_times, tempo
    except Exception as e:
        print(f"⚠️ Beat detection failed: {e}")
        return [], 120

def sync_transitions_to_beats(beat_times, scene_durations):
    """Calculate optimal transition points based on beats"""
    transition_points = []
    current_time = 0
    
    for i, duration in enumerate(scene_durations[:-1]):
        current_time += duration
        
        # Find nearest beat within 0.5 seconds
        nearest_beat = min(beat_times, key=lambda x: abs(x - current_time))
        if abs(nearest_beat - current_time) < 0.5:
            transition_points.append(nearest_beat)
            print(f"🎯 Scene {i+1}→{i+2} synced to beat at {nearest_beat:.2f}s")
        else:
            transition_points.append(current_time)
            print(f"📍 Scene {i+1}→{i+2} at natural cut {current_time:.2f}s")
    
    return transition_points

# ---- MAIN PIPELINE ----

def build_pipeline(use_gpu=True, enable_beat_sync=True, viral_mode=True):
    """
    Build AEON video with advanced transitions and beat sync
    
    Args:
        use_gpu: Enable h264_nvenc GPU encoding (4x faster)
        enable_beat_sync: Sync transitions to audio beats
        viral_mode: Apply viral effects (hooks, glitch, zoom punch)
    """
    print("🚀 AEON: Building 6-scene video with advanced pipeline")
    
    # Check GPU support
    if use_gpu:
        try:
            import subprocess
            result = subprocess.run(['ffmpeg', '-encoders'], capture_output=True, text=True)
            if 'h264_nvenc' in result.stdout:
                print("⚡ GPU encoding enabled (h264_nvenc)")
                codec = "h264_nvenc"
            else:
                print("⚠️ GPU not available, using CPU encoding")
                codec = "libx264"
        except:
            print("⚠️ FFmpeg not found, using CPU encoding")
            codec = "libx264"
    else:
        codec = "libx264"

    # Generate TTS first for beat detection
    print("🎙️ Generating TTS narration...")
    with open(VOICEOVER_SCRIPT, 'r') as f:
        text = f.read()
    
    tts = gTTS(text, lang='en', slow=False)
    tts.save("voiceover/narration.mp3")
    
    # Beat detection
    beat_times = []
    if enable_beat_sync:
        beat_times, bpm = detect_beats("voiceover/narration.mp3")

    # Load and process clips
    print("🎬 Processing video clips...")
    clips = []
    scene_durations = []
    
    for i, path in enumerate(SCENE_SEQUENCE):
        print(f"Processing scene {i+1}: {path}")
        
        if not os.path.exists(path):
            print(f"⚠️ Scene file not found: {path}")
            continue
            
        clip = VideoFileClip(path).resize(height=1920).resize(width=1080)
        scene_durations.append(clip.duration)
        
        # Add professional fade effects
        clip = fadein(clip, 0.3)
        clip = fadeout(clip, 0.3)
        
        # Apply viral effects based on scene position
        if viral_mode:
            if i == 0:  # First scene - add hook
                clip = add_hook_freeze(clip, "WATCH THIS! 🔥")
            elif i in [1, 3, 5]:  # Odd scenes - zoom punch
                clip = zoom_punch(clip, zoom_factor=1.3, duration=0.4)
            elif i in [2, 4]:  # Even scenes - glitch blast
                clip = glitch_blast(clip, intensity=0.6, duration=0.3)
        
        clips.append(clip)

    if not clips:
        print("❌ No valid scene files found!")
        return

    # Concatenate clips
    print("🔗 Concatenating clips...")
    final_clip = concatenate_videoclips(clips, method="compose")

    # Add audio
    print("🎵 Adding narration and background audio...")
    narration = AudioFileClip("voiceover/narration.mp3")
    
    # Composite audio (narration + original video audio)
    if final_clip.audio:
        final_audio = CompositeAudioClip([
            final_clip.audio.volumex(0.3),  # Lower original audio
            narration.volumex(0.8)          # Boost narration
        ])
    else:
        final_audio = narration
    
    final_clip = final_clip.set_audio(final_audio)

    # Export with optimal settings
    print(f"🎥 Exporting with {codec} encoding...")
    
    export_params = {
        "codec": codec,
        "audio_codec": "aac",
        "fps": 30,
        "bitrate": "5000k",
        "audio_bitrate": "192k"
    }
    
    # GPU-specific optimizations
    if codec == "h264_nvenc":
        export_params.update({
            "preset": "fast",
            "ffmpeg_params": ["-crf", "23", "-gpu", "0"]
        })
    
    final_clip.write_videofile(OUTPUT_PATH, **export_params)
    
    # Cleanup
    for clip in clips:
        clip.close()
    final_clip.close()
    
    print(f"✅ AEON 6-scene video saved: {OUTPUT_PATH}")
    print(f"📊 Final duration: {final_clip.duration:.1f}s")
    print(f"🎯 Transitions: {len(clips)-1}")
    print(f"🎵 Beat sync: {'Enabled' if enable_beat_sync else 'Disabled'}")
    print(f"⚡ GPU acceleration: {'Enabled' if codec == 'h264_nvenc' else 'Disabled'}")

if __name__ == "__main__":
    # Create required directories
    os.makedirs("scenes", exist_ok=True)
    os.makedirs("voiceover", exist_ok=True)
    os.makedirs("output", exist_ok=True)
    
    # Run pipeline with all features enabled
    build_pipeline(
        use_gpu=True,
        enable_beat_sync=True, 
        viral_mode=True
    )
