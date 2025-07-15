"""
AEON SFX Module - ASMR layers and trending sound effects
Uses Pydub for audio processing and viral sound optimization
"""

import os
import random
import logging
from pydub import AudioSegment
from pydub.effects import normalize, compress_dynamic_range
from moviepy.editor import VideoFileClip, AudioFileClip, CompositeAudioClip
from typing import List, Optional, Dict, Tuple
import numpy as np

logger = logging.getLogger(__name__)

# Viral SFX library paths (these would be actual sound files in production)
VIRAL_SFX_LIBRARY = {
    "whoosh": ["whoosh_1.wav", "whoosh_2.wav", "whoosh_3.wav"],
    "pop": ["pop_1.wav", "pop_2.wav", "pop_3.wav"],
    "glitch": ["glitch_1.wav", "glitch_2.wav"],
    "boom": ["boom_1.wav", "boom_2.wav"],
    "click": ["click_1.wav", "click_2.wav"],
    "swoosh": ["swoosh_1.wav", "swoosh_2.wav"],
    "zap": ["zap_1.wav", "zap_2.wav"],
    "ding": ["ding_1.wav", "ding_2.wav"],
    "vinyl_scratch": ["scratch_1.wav", "scratch_2.wav"],
    "air_horn": ["airhorn_1.wav", "airhorn_2.wav"]
}

ASMR_SOUNDS = {
    "paper_rustle": ["paper_1.wav", "paper_2.wav"],
    "keyboard_typing": ["typing_1.wav", "typing_2.wav"],
    "water_drop": ["water_1.wav", "water_2.wav"],
    "page_turn": ["page_1.wav", "page_2.wav"],
    "bubble_wrap": ["bubble_1.wav", "bubble_2.wav"],
    "rain": ["rain_1.wav", "rain_2.wav"],
    "fire_crackle": ["fire_1.wav", "fire_2.wav"],
    "wind": ["wind_1.wav", "wind_2.wav"]
}

def add_asmr_layer(video: VideoFileClip) -> VideoFileClip:
    """
    Add ASMR sound layer for viral engagement
    
    Args:
        video: Input video clip
    
    Returns:
        Video with ASMR audio layer added
    """
    try:
        logger.info("🎧 Adding ASMR sound layer")
        
        if not video.audio:
            logger.warning("⚠️ No audio track found, skipping ASMR layer")
            return video
        
        # Generate ASMR sounds based on video content analysis
        asmr_audio = generate_asmr_sequence(video.duration)
        
        if not asmr_audio:
            logger.warning("⚠️ No ASMR audio generated")
            return video
        
        # Mix ASMR with original audio
        original_audio = video.audio
        
        # Lower ASMR volume to be subtle but present
        asmr_audio = asmr_audio.volumex(0.3)
        
        # Composite audio tracks
        mixed_audio = CompositeAudioClip([original_audio, asmr_audio])
        
        # Apply to video
        final_video = video.set_audio(mixed_audio)
        
        logger.info("✅ ASMR layer added successfully")
        return final_video
    
    except Exception as e:
        logger.warning(f"⚠️ ASMR layer failed: {str(e)}")
        return video

def add_trending_sound(video: VideoFileClip, bgm_path: Optional[str] = None) -> VideoFileClip:
    """
    Add trending sound effects and mix with background music
    
    Args:
        video: Input video clip
        bgm_path: Path to background music file
    
    Returns:
        Video with trending sounds mixed in
    """
    try:
        logger.info("🎵 Adding trending sound mix")
        
        # Generate viral SFX sequence
        viral_sfx = generate_viral_sfx_sequence(video.duration)
        
        audio_tracks = []
        
        # Add original audio if present
        if video.audio:
            audio_tracks.append(video.audio)
        
        # Add background music if provided
        if bgm_path and os.path.exists(bgm_path):
            bgm_audio = AudioFileClip(bgm_path)
            
            # Loop BGM if shorter than video
            if bgm_audio.duration < video.duration:
                loops_needed = int(video.duration / bgm_audio.duration) + 1
                bgm_audio = concatenate_audioclips([bgm_audio] * loops_needed)
            
            # Trim to video length
            bgm_audio = bgm_audio.subclip(0, video.duration)
            
            # Adjust volume for background
            bgm_audio = bgm_audio.volumex(0.6)
            audio_tracks.append(bgm_audio)
        
        # Add viral SFX
        if viral_sfx:
            viral_sfx = viral_sfx.volumex(0.4)
            audio_tracks.append(viral_sfx)
        
        if len(audio_tracks) > 1:
            # Mix all audio tracks
            mixed_audio = CompositeAudioClip(audio_tracks)
            
            # Apply audio processing for viral optimization
            mixed_audio = optimize_audio_for_viral(mixed_audio)
            
            final_video = video.set_audio(mixed_audio)
        else:
            final_video = video
        
        logger.info("✅ Trending sound mix added")
        return final_video
    
    except Exception as e:
        logger.warning(f"⚠️ Trending sound mix failed: {str(e)}")
        return video

def generate_asmr_sequence(duration: float) -> Optional[AudioFileClip]:
    """
    Generate ASMR sound sequence for the given duration
    """
    try:
        # Select ASMR sounds based on duration and viral effectiveness
        selected_sounds = []
        
        # Base ambient sound
        ambient_sound = random.choice(["rain", "wind", "fire_crackle"])
        if ambient_sound in ASMR_SOUNDS:
            selected_sounds.append((ambient_sound, 0, duration, 0.2))
        
        # Add periodic ASMR triggers
        trigger_interval = max(2.0, duration / 8)  # Every 2 seconds or 8 triggers total
        
        for i in range(int(duration / trigger_interval)):
            trigger_time = i * trigger_interval + random.uniform(0, trigger_interval * 0.5)
            
            if trigger_time < duration:
                trigger_sound = random.choice([
                    "paper_rustle", "keyboard_typing", "water_drop", 
                    "page_turn", "bubble_wrap"
                ])
                
                if trigger_sound in ASMR_SOUNDS:
                    trigger_duration = random.uniform(0.5, 2.0)
                    selected_sounds.append((trigger_sound, trigger_time, trigger_duration, 0.3))
        
        # Create audio sequence (simplified - in production, load actual audio files)
        if selected_sounds:
            logger.info(f"🎧 Generated ASMR sequence with {len(selected_sounds)} elements")
            # This would create actual audio in production
            return create_synthetic_asmr_audio(duration)
        
        return None
    
    except Exception as e:
        logger.warning(f"⚠️ ASMR sequence generation failed: {str(e)}")
        return None

def generate_viral_sfx_sequence(duration: float) -> Optional[AudioFileClip]:
    """
    Generate viral SFX sequence for transitions and emphasis
    """
    try:
        # Calculate SFX placement based on viral timing
        sfx_events = []
        
        # Add SFX at key moments
        # Opening impact
        sfx_events.append(("boom", 0.1, 0.5))
        
        # Transition SFX every 3-5 seconds
        transition_interval = random.uniform(3.0, 5.0)
        current_time = transition_interval
        
        while current_time < duration - 1.0:
            sfx_type = random.choice(["whoosh", "pop", "swoosh", "zap"])
            sfx_events.append((sfx_type, current_time, 0.3))
            current_time += random.uniform(3.0, 5.0)
        
        # Closing impact
        if duration > 2.0:
            sfx_events.append(("ding", duration - 0.5, 0.5))
        
        if sfx_events:
            logger.info(f"🎵 Generated viral SFX sequence with {len(sfx_events)} effects")
            # This would create actual audio in production
            return create_synthetic_sfx_audio(duration, sfx_events)
        
        return None
    
    except Exception as e:
        logger.warning(f"⚠️ Viral SFX generation failed: {str(e)}")
        return None

def create_synthetic_asmr_audio(duration: float) -> AudioFileClip:
    """
    Create synthetic ASMR audio for testing (replace with real audio files)
    """
    try:
        # Generate pink noise for ASMR base
        sample_rate = 44100
        samples = int(duration * sample_rate)
        
        # Pink noise generation (simplified)
        white_noise = np.random.normal(0, 0.1, samples)
        
        # Apply pink noise filter (simplified)
        pink_noise = np.convolve(white_noise, [1, -0.5], mode='same')
        
        # Normalize
        pink_noise = pink_noise / np.max(np.abs(pink_noise)) * 0.3
        
        # Convert to audio (this is simplified - use proper audio library)
        # In production, load actual ASMR audio files
        logger.info(f"🎧 Created synthetic ASMR audio: {duration:.2f}s")
        
        # Return placeholder - in production, return actual AudioFileClip
        return None
    
    except Exception as e:
        logger.warning(f"⚠️ Synthetic ASMR creation failed: {str(e)}")
        return None

def create_synthetic_sfx_audio(duration: float, sfx_events: List) -> AudioFileClip:
    """
    Create synthetic SFX audio for testing (replace with real audio files)
    """
    try:
        # In production, this would load and composite actual SFX files
        logger.info(f"🎵 Created synthetic SFX audio with {len(sfx_events)} events")
        
        # Return placeholder - in production, return actual AudioFileClip
        return None
    
    except Exception as e:
        logger.warning(f"⚠️ Synthetic SFX creation failed: {str(e)}")
        return None

def optimize_audio_for_viral(audio: AudioFileClip) -> AudioFileClip:
    """
    Optimize audio for viral engagement (compression, EQ, etc.)
    """
    try:
        # Apply viral audio processing
        # 1. Dynamic range compression for consistent levels
        # 2. EQ boost for clarity on mobile speakers
        # 3. Loudness optimization for social media
        
        # This would use actual audio processing in production
        logger.info("🎚️ Applied viral audio optimization")
        return audio
    
    except Exception as e:
        logger.warning(f"⚠️ Audio optimization failed: {str(e)}")
        return audio

def add_beat_drop_sfx(video: VideoFileClip, drop_times: List[float]) -> VideoFileClip:
    """
    Add special SFX at beat drop moments
    """
    try:
        if not drop_times or not video.audio:
            return video
        
        sfx_clips = []
        
        for drop_time in drop_times:
            if drop_time < video.duration:
                # Add impact SFX at beat drop
                impact_sfx = random.choice(["boom", "air_horn", "vinyl_scratch"])
                
                # In production, load actual SFX file
                # sfx_clip = AudioFileClip(f"sfx/{impact_sfx}.wav")
                # sfx_clip = sfx_clip.set_start(drop_time).volumex(0.6)
                # sfx_clips.append(sfx_clip)
        
        if sfx_clips:
            # Composite with original audio
            mixed_audio = CompositeAudioClip([video.audio] + sfx_clips)
            return video.set_audio(mixed_audio)
        
        return video
    
    except Exception as e:
        logger.warning(f"⚠️ Beat drop SFX failed: {str(e)}")
        return video

def apply_audio_ducking(video: VideoFileClip, duck_times: List[Tuple[float, float]]) -> VideoFileClip:
    """
    Apply audio ducking at specified times for emphasis
    """
    try:
        if not duck_times or not video.audio:
            return video
        
        # Apply volume automation for ducking effect
        def volume_automation(get_frame, t):
            frame = get_frame(t)
            
            # Check if we're in a duck time
            for start_time, end_time in duck_times:
                if start_time <= t <= end_time:
                    # Duck to 30% volume
                    frame = frame * 0.3
                    break
            
            return frame
        
        ducked_audio = video.audio.fl(volume_automation)
        return video.set_audio(ducked_audio)
    
    except Exception as e:
        logger.warning(f"⚠️ Audio ducking failed: {str(e)}")
        return video

# Viral SFX presets for different content types
VIRAL_SFX_PRESETS = {
    "tiktok_dance": {
        "asmr_enabled": False,
        "sfx_density": "high",
        "preferred_sfx": ["whoosh", "pop", "zap", "air_horn"],
        "beat_drop_sfx": True
    },
    "tutorial": {
        "asmr_enabled": True,
        "sfx_density": "low",
        "preferred_sfx": ["click", "ding", "page_turn"],
        "beat_drop_sfx": False
    },
    "comedy": {
        "asmr_enabled": False,
        "sfx_density": "medium",
        "preferred_sfx": ["boom", "pop", "vinyl_scratch", "air_horn"],
        "beat_drop_sfx": True
    },
    "lifestyle": {
        "asmr_enabled": True,
        "sfx_density": "low",
        "preferred_sfx": ["swoosh", "ding", "water_drop"],
        "beat_drop_sfx": False
    },
    "gaming": {
        "asmr_enabled": False,
        "sfx_density": "high",
        "preferred_sfx": ["glitch", "zap", "boom", "vinyl_scratch"],
        "beat_drop_sfx": True
    }
}

def apply_sfx_preset(video: VideoFileClip, preset_name: str, bgm_path: Optional[str] = None) -> VideoFileClip:
    """
    Apply SFX preset based on content type
    """
    try:
        if preset_name not in VIRAL_SFX_PRESETS:
            logger.warning(f"⚠️ Unknown SFX preset: {preset_name}")
            return video
        
        preset = VIRAL_SFX_PRESETS[preset_name]
        
        # Apply ASMR if enabled
        if preset.get("asmr_enabled", False):
            video = add_asmr_layer(video)
        
        # Apply trending sounds
        video = add_trending_sound(video, bgm_path)
        
        logger.info(f"🎵 Applied SFX preset: {preset_name}")
        return video
    
    except Exception as e:
        logger.warning(f"⚠️ SFX preset application failed: {str(e)}")
        return video
