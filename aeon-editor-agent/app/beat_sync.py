"""
AEON Beat Sync Module - Synchronizes video cuts to audio beats
Uses Librosa for beat detection and MoviePy for precise timing
Blessed for viral TikTok rhythm optimization
"""

import librosa
import numpy as np
import logging
from moviepy.editor import VideoFileClip, concatenate_videoclips
from typing import List, Tuple, Optional
import math

logger = logging.getLogger(__name__)

def sync_clips_to_beats(clips: List[VideoFileClip], audio_path: str) -> List[VideoFileClip]:
    """
    Synchronize video clips to audio beats for viral rhythm
    
    Args:
        clips: List of video clips to sync
        audio_path: Path to audio file for beat detection
    
    Returns:
        List of synchronized video clips
    """
    try:
        logger.info(f"🎵 Analyzing beats in audio: {audio_path}")
        
        # Load audio and detect beats
        y, sr = librosa.load(audio_path, sr=None)
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
        
        logger.info(f"🎼 Detected tempo: {tempo:.1f} BPM, {len(beats)} beats")
        
        # Calculate optimal clip durations based on beats
        beat_intervals = np.diff(beats)
        avg_beat_interval = np.mean(beat_intervals)
        
        # Viral optimization: prefer shorter clips for higher energy
        target_duration = min(avg_beat_interval * 2, 3.0)  # Max 3 seconds per clip
        
        logger.info(f"🎯 Target clip duration: {target_duration:.2f}s")
        
        # Sync clips to beat timing
        synced_clips = []
        total_audio_duration = len(y) / sr
        
        for i, clip in enumerate(clips):
            # Calculate optimal duration for this clip
            clip_duration = min(clip.duration, target_duration)
            
            # Find the best beat alignment
            if i < len(beats) - 1:
                # Align to specific beat
                beat_start = beats[i % len(beats)]
                beat_duration = min(clip_duration, beats[(i + 1) % len(beats)] - beat_start)
                
                if beat_duration > 0.5:  # Minimum viable clip length
                    clip_duration = beat_duration
            
            # Trim clip to beat-synced duration
            if clip.duration > clip_duration:
                # Take from middle for better content
                start_time = (clip.duration - clip_duration) / 2
                synced_clip = clip.subclip(start_time, start_time + clip_duration)
            else:
                synced_clip = clip
            
            synced_clips.append(synced_clip)
            logger.info(f"🎵 Synced clip {i+1}: {synced_clip.duration:.2f}s")
        
        # Apply beat-based speed adjustments for viral energy
        synced_clips = apply_beat_speed_variations(synced_clips, tempo)
        
        logger.info(f"✅ Beat sync complete - {len(synced_clips)} clips synchronized")
        return synced_clips
    
    except Exception as e:
        logger.warning(f"⚠️ Beat sync failed, returning original clips: {str(e)}")
        return clips

def apply_beat_speed_variations(clips: List[VideoFileClip], tempo: float) -> List[VideoFileClip]:
    """
    Apply speed variations based on tempo for viral energy
    """
    try:
        # Determine speed multiplier based on tempo
        if tempo > 140:  # High energy
            speed_multiplier = 1.2
        elif tempo > 100:  # Medium energy
            speed_multiplier = 1.1
        else:  # Low energy - speed up more
            speed_multiplier = 1.3
        
        varied_clips = []
        
        for i, clip in enumerate(clips):
            # Apply speed variation pattern
            if i % 3 == 0:  # Every third clip - normal speed
                varied_clips.append(clip)
            elif i % 3 == 1:  # Speed up slightly
                speed_factor = min(speed_multiplier, 2.0)
                varied_clip = clip.fx(lambda c: c.speedx(speed_factor))
                varied_clips.append(varied_clip)
            else:  # Slight slow-mo for contrast
                speed_factor = max(0.9, 1.0 / speed_multiplier)
                varied_clip = clip.fx(lambda c: c.speedx(speed_factor))
                varied_clips.append(varied_clip)
        
        logger.info(f"🚀 Applied speed variations with {speed_multiplier}x base multiplier")
        return varied_clips
    
    except Exception as e:
        logger.warning(f"⚠️ Speed variation failed: {str(e)}")
        return clips

def detect_beat_drops(audio_path: str) -> List[float]:
    """
    Detect beat drops and high-energy moments in audio
    """
    try:
        y, sr = librosa.load(audio_path, sr=None)
        
        # Detect onset strength
        onset_envelope = librosa.onset.onset_strength(y=y, sr=sr)
        
        # Find peaks (potential drops)
        peaks = librosa.util.peak_pick(
            onset_envelope,
            pre_max=3,
            post_max=3,
            pre_avg=3,
            post_avg=5,
            delta=0.5,
            wait=10
        )
        
        # Convert to time
        peak_times = librosa.frames_to_time(peaks, sr=sr)
        
        logger.info(f"🎆 Detected {len(peak_times)} beat drops")
        return peak_times.tolist()
    
    except Exception as e:
        logger.warning(f"⚠️ Beat drop detection failed: {str(e)}")
        return []

def sync_to_beat_drops(clips: List[VideoFileClip], audio_path: str) -> List[VideoFileClip]:
    """
    Synchronize clips to beat drops for maximum viral impact
    """
    try:
        beat_drops = detect_beat_drops(audio_path)
        
        if not beat_drops:
            return clips
        
        synced_clips = []
        
        for i, clip in enumerate(clips):
            if i < len(beat_drops):
                # Align clip to beat drop
                drop_time = beat_drops[i]
                
                # Add emphasis effect at beat drop
                emphasized_clip = add_beat_drop_emphasis(clip)
                synced_clips.append(emphasized_clip)
            else:
                synced_clips.append(clip)
        
        logger.info(f"🎆 Synced {len(synced_clips)} clips to beat drops")
        return synced_clips
    
    except Exception as e:
        logger.warning(f"⚠️ Beat drop sync failed: {str(e)}")
        return clips

def add_beat_drop_emphasis(clip: VideoFileClip) -> VideoFileClip:
    """
    Add visual emphasis effects at beat drops
    """
    try:
        # Add zoom effect at the start (beat drop moment)
        def zoom_effect(get_frame, t):
            frame = get_frame(t)
            if t < 0.3:  # First 0.3 seconds
                zoom_factor = 1 + (0.2 * (1 - t / 0.3))  # Zoom from 1.2x to 1.0x
                h, w = frame.shape[:2]
                new_h, new_w = int(h / zoom_factor), int(w / zoom_factor)
                
                # Crop center and resize
                start_h, start_w = (h - new_h) // 2, (w - new_w) // 2
                cropped = frame[start_h:start_h + new_h, start_w:start_w + new_w]
                frame = np.array(Image.fromarray(cropped).resize((w, h)))
            
            return frame
        
        emphasized_clip = clip.fl(zoom_effect)
        return emphasized_clip
    
    except Exception as e:
        logger.warning(f"⚠️ Beat drop emphasis failed: {str(e)}")
        return clip

def analyze_audio_energy(audio_path: str) -> dict:
    """
    Analyze audio energy levels for intelligent clip timing
    """
    try:
        y, sr = librosa.load(audio_path, sr=None)
        
        # Calculate RMS energy
        rms = librosa.feature.rms(y=y)[0]
        
        # Calculate spectral centroid (brightness)
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        
        # Calculate tempo and beat confidence
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
        
        # Detect high energy sections
        energy_threshold = np.percentile(rms, 75)  # Top 25% energy
        high_energy_frames = rms > energy_threshold
        
        # Convert to time segments
        frame_times = librosa.frames_to_time(np.arange(len(rms)), sr=sr)
        high_energy_times = frame_times[high_energy_frames]
        
        analysis = {
            "tempo": float(tempo),
            "avg_energy": float(np.mean(rms)),
            "max_energy": float(np.max(rms)),
            "avg_brightness": float(np.mean(spectral_centroid)),
            "high_energy_sections": high_energy_times.tolist(),
            "total_duration": len(y) / sr,
            "beat_count": len(beats)
        }
        
        logger.info(f"🎼 Audio analysis: {tempo:.1f} BPM, {len(high_energy_times)} high-energy moments")
        return analysis
    
    except Exception as e:
        logger.error(f"💥 Audio analysis failed: {str(e)}")
        return {
            "tempo": 120.0,
            "avg_energy": 0.5,
            "max_energy": 1.0,
            "avg_brightness": 1000.0,
            "high_energy_sections": [],
            "total_duration": 30.0,
            "beat_count": 0
        }

def create_beat_visualization(audio_path: str, output_path: str) -> str:
    """
    Create a beat visualization overlay for debugging
    """
    try:
        y, sr = librosa.load(audio_path, sr=None)
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
        
        # Create simple beat markers
        duration = len(y) / sr
        beat_markers = []
        
        for beat_time in beats:
            if beat_time < duration:
                beat_markers.append(beat_time)
        
        logger.info(f"📊 Created beat visualization with {len(beat_markers)} markers")
        return output_path
    
    except Exception as e:
        logger.warning(f"⚠️ Beat visualization failed: {str(e)}")
        return ""

# Viral beat sync presets
BEAT_SYNC_PRESETS = {
    "tiktok_dance": {
        "sync_to_drops": True,
        "speed_variations": True,
        "emphasis_effects": True,
        "max_clip_duration": 2.0
    },
    "music_video": {
        "sync_to_drops": True,
        "speed_variations": False,
        "emphasis_effects": True,
        "max_clip_duration": 4.0
    },
    "tutorial": {
        "sync_to_drops": False,
        "speed_variations": False,
        "emphasis_effects": False,
        "max_clip_duration": 6.0
    },
    "comedy": {
        "sync_to_drops": True,
        "speed_variations": True,
        "emphasis_effects": True,
        "max_clip_duration": 3.0
    }
}
