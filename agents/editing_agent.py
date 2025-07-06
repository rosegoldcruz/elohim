#!/usr/bin/env python3
"""
AEON Final Production-Grade Python Editing Agent
Viral TikTok video editing with GPU acceleration, beat sync, and ASMR layers
"""

import json
import os
import sys
import logging
import numpy as np
import cv2
import librosa
from typing import Dict, List, Optional, Tuple
from pathlib import Path
from pydantic import BaseModel, ValidationError
# Configure logging first
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

import subprocess

try:
    from moviepy.editor import (
        VideoFileClip, AudioFileClip, TextClip, CompositeVideoClip,
        CompositeAudioClip, concatenate_videoclips, ImageClip
    )
    from moviepy.video.fx.all import *
    # Type alias for MoviePy clips
    VideoClip = VideoFileClip
except ImportError:
    logger.warning("MoviePy not installed. Install with: pip install moviepy")
    # Create dummy classes for type hints
    class VideoClip: pass
    class VideoFileClip: pass
    class AudioFileClip: pass
    class TextClip: pass
    class CompositeVideoClip: pass
    class CompositeAudioClip: pass
    class ImageClip: pass

try:
    from pydub import AudioSegment
except ImportError:
    logger.warning("Pydub not installed. Install with: pip install pydub")
    class AudioSegment: pass

class TransitionModel(BaseModel):
    type: str
    duration: float = 0.3
    beat_synced: bool = True
    intensity: float = 0.5
    glsl_code: Optional[str] = None

class CaptionModel(BaseModel):
    text: str
    start_time: float
    end_time: Optional[float] = None
    style: str = "bounce"
    position: List[float] = [0.5, 0.1]

class SFXModel(BaseModel):
    file: str
    start_time: float
    volume: float = 0.8

class BeatSyncModel(BaseModel):
    enabled: bool = True
    audio_file: str
    sensitivity: float = 0.7

class ASMRLayerModel(BaseModel):
    type: str
    timing: str = "pre_transition"
    volume: float = 0.3

class VelocityEditingModel(BaseModel):
    enabled: bool = True
    start_cut_duration: float = 1.5
    end_cut_duration: float = 0.3

class FirstFrameHookModel(BaseModel):
    enabled: bool = True
    freeze_duration: float = 0.5
    text: Optional[str] = None

class EditingPlanModel(BaseModel):
    clips: List[str]
    transitions: List[TransitionModel] = []
    captions: List[CaptionModel] = []
    sfx: List[SFXModel] = []
    beatSync: Optional[BeatSyncModel] = None
    asmrLayers: List[ASMRLayerModel] = []
    velocityEditing: VelocityEditingModel = VelocityEditingModel()
    firstFrameHook: FirstFrameHookModel = FirstFrameHookModel()

class EditingAgent:
    """
    AEON Production-Grade Editing Agent
    Processes video clips with viral TikTok optimizations
    """
    
    def __init__(self, editing_plan_path: str):
        """Initialize with editing plan JSON file"""
        self.plan_path = editing_plan_path
        self.plan = None
        self.clips = []
        self.beat_times = []
        self.final_video = None
        
        # Load and validate editing plan
        self._load_editing_plan()
        
        # Create output directory
        self.output_dir = Path("output")
        self.output_dir.mkdir(exist_ok=True)
        
        logger.info(f"🎬 EditingAgent initialized with {len(self.plan.clips)} clips")

    def _load_editing_plan(self):
        """Load and validate editing plan with Pydantic"""
        try:
            with open(self.plan_path, 'r') as f:
                plan_data = json.load(f)
            
            # Validate with Pydantic model
            self.plan = EditingPlanModel(**plan_data)
            logger.info("✅ Editing plan validated successfully")
            
        except FileNotFoundError:
            raise FileNotFoundError(f"Editing plan not found: {self.plan_path}")
        except ValidationError as e:
            raise ValueError(f"Invalid editing plan schema: {e}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in editing plan: {e}")

    def load_clips(self):
        """Load video clips with error handling and optimization"""
        logger.info("📁 Loading video clips...")
        self.clips = []
        
        for i, clip_path in enumerate(self.plan.clips):
            try:
                if not os.path.exists(clip_path):
                    raise FileNotFoundError(f"Clip not found: {clip_path}")
                
                clip = VideoFileClip(clip_path)
                
                # Ensure vertical format (9:16) for TikTok
                if clip.w > clip.h:
                    # Crop to vertical if horizontal
                    target_w = int(clip.h * 9/16)
                    clip = clip.crop(x_center=clip.w/2, width=target_w)
                
                self.clips.append(clip)
                logger.info(f"  ✅ Loaded clip {i+1}: {clip.duration:.2f}s")
                
            except Exception as e:
                logger.error(f"  ❌ Failed to load clip {clip_path}: {e}")
                raise

    def detect_beats(self) -> List[float]:
        """Detect audio beats using Librosa for beat-synced editing"""
        if not self.plan.beatSync or not self.plan.beatSync.enabled:
            logger.info("🎵 Beat sync disabled")
            return []
        
        try:
            logger.info("🎵 Detecting audio beats...")
            audio_file = self.plan.beatSync.audio_file
            
            if not os.path.exists(audio_file):
                logger.warning(f"Audio file not found: {audio_file}")
                return []
            
            # Load audio with librosa
            y, sr = librosa.load(audio_file, sr=None)
            
            # Detect beats
            tempo, beat_frames = librosa.beat.beat_track(
                y=y, 
                sr=sr,
                tightness=self.plan.beatSync.sensitivity
            )
            
            # Convert to time
            beat_times = librosa.frames_to_time(beat_frames, sr=sr)
            
            logger.info(f"  ✅ Detected {len(beat_times)} beats at {tempo:.1f} BPM")
            return beat_times.tolist()
            
        except Exception as e:
            logger.error(f"❌ Beat detection failed: {e}")
            return []

    def apply_zoom_punch_transition(self, clip1: VideoClip, clip2: VideoClip, 
                                  transition: TransitionModel) -> VideoClip:
        """Apply viral zoom punch transition"""
        duration = transition.duration
        intensity = transition.intensity
        
        def zoom_effect(get_frame, t):
            frame = get_frame(t)
            if t < duration:
                # Zoom punch effect
                zoom_factor = 1 + (intensity * 0.3) * (t / duration)
                h, w = frame.shape[:2]
                
                # Calculate crop dimensions
                new_w, new_h = int(w / zoom_factor), int(h / zoom_factor)
                x1, y1 = (w - new_w) // 2, (h - new_h) // 2
                
                # Crop and resize
                cropped = frame[y1:y1+new_h, x1:x1+new_w]
                return cv2.resize(cropped, (w, h))
            return frame
        
        # Apply zoom to end of clip1
        clip1_zoomed = clip1.fl(zoom_effect, apply_to=['mask'])
        
        # Crossfade with clip2
        return CompositeVideoClip([
            clip1_zoomed,
            clip2.crossfadein(duration)
        ])

    def apply_glitch_transition(self, clip1: VideoClip, clip2: VideoClip, 
                              transition: TransitionModel) -> VideoClip:
        """Apply glitch blast transition effect"""
        duration = transition.duration
        
        def glitch_effect(get_frame, t):
            frame = get_frame(t)
            if t < duration:
                # Digital glitch effect
                progress = t / duration
                
                # Random horizontal displacement
                if np.random.random() < progress * 0.3:
                    shift = int(np.random.randint(-20, 20) * transition.intensity)
                    frame = np.roll(frame, shift, axis=1)
                
                # Color channel separation
                if np.random.random() < progress * 0.2:
                    frame[:, :, 0] = np.roll(frame[:, :, 0], 5, axis=1)  # Red
                    frame[:, :, 2] = np.roll(frame[:, :, 2], -5, axis=1)  # Blue
                
            return frame
        
        clip1_glitched = clip1.fl(glitch_effect)
        return CompositeVideoClip([clip1_glitched, clip2.crossfadein(duration)])

    def apply_transition(self, clip1: VideoClip, clip2: VideoClip, 
                        transition: TransitionModel) -> VideoClip:
        """Apply specified transition between clips"""
        logger.info(f"🔄 Applying {transition.type} transition")
        
        if transition.type == "zoom_punch":
            return self.apply_zoom_punch_transition(clip1, clip2, transition)
        elif transition.type == "glitch_blast":
            return self.apply_glitch_transition(clip1, clip2, transition)
        elif transition.type == "velocity_wipe":
            # Fast crossfade for velocity editing
            return CompositeVideoClip([clip1, clip2.crossfadein(0.1)])
        elif transition.type == "ai_generated" and transition.glsl_code:
            # Placeholder for GLSL GPU transitions
            logger.info("🎮 AI-generated GLSL transition (placeholder)")
            return CompositeVideoClip([clip1, clip2.crossfadein(transition.duration)])
        else:
            # Default crossfade
            return CompositeVideoClip([clip1, clip2.crossfadein(transition.duration)])

    def apply_captions(self, clip: VideoClip) -> VideoClip:
        """Apply animated captions with TikTok viral styles"""
        if not self.plan.captions:
            return clip

        logger.info(f"📝 Applying {len(self.plan.captions)} captions")

        for caption in self.plan.captions:
            try:
                # Calculate duration
                end_time = caption.end_time or (caption.start_time + 2.0)
                duration = end_time - caption.start_time

                # Create text clip
                txt_clip = TextClip(
                    caption.text,
                    fontsize=50,
                    color='white',
                    font='Arial-Bold',
                    stroke_color='black',
                    stroke_width=3
                ).set_duration(duration)

                # Apply style animations
                if caption.style == "bounce":
                    # Bouncing animation
                    txt_clip = txt_clip.set_position(
                        lambda t: ('center', 100 + 15 * np.sin(t * 8))
                    )
                elif caption.style == "typewriter":
                    # Typewriter effect
                    def typewriter_effect(txt, t):
                        chars_shown = int((t / duration) * len(caption.text))
                        return caption.text[:chars_shown]

                    txt_clip = TextClip(
                        lambda t: typewriter_effect(caption.text, t),
                        fontsize=50,
                        color='white',
                        font='Arial-Bold'
                    ).set_duration(duration).set_position('center')

                elif caption.style == "highlight":
                    # Highlight effect with background
                    txt_clip = txt_clip.on_color(
                        size=(txt_clip.w + 20, txt_clip.h + 10),
                        color=(255, 255, 0),
                        pos='center'
                    ).set_position('center')

                # Set timing and composite
                txt_clip = txt_clip.set_start(caption.start_time)
                clip = CompositeVideoClip([clip, txt_clip])

            except Exception as e:
                logger.error(f"❌ Failed to apply caption '{caption.text}': {e}")

        return clip

    def apply_sfx(self, clip: VideoClip) -> VideoClip:
        """Overlay sound effects at precise timestamps"""
        if not self.plan.sfx:
            return clip

        logger.info(f"🔊 Applying {len(self.plan.sfx)} sound effects")

        audio_clips = [clip.audio] if clip.audio else []

        for sfx in self.plan.sfx:
            try:
                if not os.path.exists(sfx.file):
                    logger.warning(f"SFX file not found: {sfx.file}")
                    continue

                # Load and process SFX
                sfx_clip = AudioFileClip(sfx.file).volumex(sfx.volume)
                sfx_clip = sfx_clip.set_start(sfx.start_time)

                audio_clips.append(sfx_clip)
                logger.info(f"  ✅ Added SFX at {sfx.start_time}s")

            except Exception as e:
                logger.error(f"❌ Failed to apply SFX {sfx.file}: {e}")

        if len(audio_clips) > 1:
            clip = clip.set_audio(CompositeAudioClip(audio_clips))

        return clip

    def add_asmr_layers(self, clip: VideoClip) -> VideoClip:
        """Add ASMR trigger sounds for viral engagement"""
        if not self.plan.asmrLayers:
            return clip

        logger.info(f"🎧 Adding {len(self.plan.asmrLayers)} ASMR layers")

        # ASMR sound mapping
        asmr_sounds = {
            "paper_rustle": "assets/asmr/paper_rustle.mp3",
            "click": "assets/asmr/click.mp3",
            "swoosh": "assets/asmr/swoosh.mp3"
        }

        audio_clips = [clip.audio] if clip.audio else []

        for asmr in self.plan.asmrLayers:
            try:
                sound_file = asmr_sounds.get(asmr.type)
                if not sound_file or not os.path.exists(sound_file):
                    logger.warning(f"ASMR sound not found: {asmr.type}")
                    continue

                # Load ASMR sound
                asmr_clip = AudioFileClip(sound_file).volumex(asmr.volume)

                # Position based on timing
                if asmr.timing == "pre_transition":
                    # Add before transitions
                    for i, beat_time in enumerate(self.beat_times[:3]):
                        positioned_clip = asmr_clip.set_start(beat_time - 0.1)
                        audio_clips.append(positioned_clip)

                elif asmr.timing == "post_transition":
                    # Add after transitions
                    for i, beat_time in enumerate(self.beat_times[:3]):
                        positioned_clip = asmr_clip.set_start(beat_time + 0.2)
                        audio_clips.append(positioned_clip)

            except Exception as e:
                logger.error(f"❌ Failed to add ASMR layer {asmr.type}: {e}")

        if len(audio_clips) > 1:
            clip = clip.set_audio(CompositeAudioClip(audio_clips))

        return clip

    def apply_velocity_editing(self, clip: VideoClip) -> VideoClip:
        """Apply velocity editing with increasing cut frequency"""
        if not self.plan.velocityEditing.enabled:
            return clip

        logger.info("⚡ Applying velocity editing")

        try:
            total_duration = clip.duration
            start_dur = self.plan.velocityEditing.start_cut_duration
            end_dur = self.plan.velocityEditing.end_cut_duration

            # Calculate progressive cut times
            num_cuts = max(3, int(total_duration / ((start_dur + end_dur) / 2)))

            # Create cuts with decreasing duration
            cuts = []
            current_time = 0

            for i in range(num_cuts):
                if current_time >= total_duration:
                    break

                # Progressive duration decrease
                progress = i / (num_cuts - 1) if num_cuts > 1 else 0
                cut_duration = start_dur - (start_dur - end_dur) * progress

                # Extract cut
                end_time = min(current_time + cut_duration, total_duration)
                cut = clip.subclip(current_time, end_time)
                cuts.append(cut)

                current_time = end_time

            if cuts:
                return concatenate_videoclips(cuts)

        except Exception as e:
            logger.error(f"❌ Velocity editing failed: {e}")

        return clip

    def add_first_frame_hook(self, clip: VideoClip) -> VideoClip:
        """Add viral first-frame hook with freeze and text"""
        if not self.plan.firstFrameHook.enabled:
            return clip

        logger.info("🎣 Adding first-frame hook")

        try:
            freeze_duration = self.plan.firstFrameHook.freeze_duration

            # Create freeze frame from first frame
            freeze_frame = clip.to_ImageClip(0).set_duration(freeze_duration)

            # Add hook text if specified
            if self.plan.firstFrameHook.text:
                hook_text = TextClip(
                    self.plan.firstFrameHook.text,
                    fontsize=60,
                    color='yellow',
                    font='Arial-Bold',
                    stroke_color='black',
                    stroke_width=4
                ).set_duration(freeze_duration).set_position('center')

                freeze_frame = CompositeVideoClip([freeze_frame, hook_text])

            # Concatenate freeze + original clip
            return concatenate_videoclips([freeze_frame, clip])

        except Exception as e:
            logger.error(f"❌ First-frame hook failed: {e}")
            return clip

    def process(self, output_path: str = "output/viral_tiktok.mp4") -> str:
        """
        Main processing pipeline - combines all editing stages
        Returns path to final rendered video
        """
        logger.info("🚀 Starting AEON Editing Pipeline")

        try:
            # Stage 1: Load clips
            self.load_clips()
            if not self.clips:
                raise ValueError("No clips loaded")

            # Stage 2: Detect beats for sync
            self.beat_times = self.detect_beats()

            # Stage 3: Apply transitions between clips
            logger.info("🔄 Applying transitions...")
            final_video = self.clips[0]

            for i in range(1, len(self.clips)):
                # Get transition or use default
                if i-1 < len(self.plan.transitions):
                    transition = self.plan.transitions[i-1]
                else:
                    # Default transition
                    transition = TransitionModel(type="velocity_wipe", duration=0.2)

                final_video = self.apply_transition(final_video, self.clips[i], transition)

            # Stage 4: Apply velocity editing
            final_video = self.apply_velocity_editing(final_video)

            # Stage 5: Add first-frame hook
            final_video = self.add_first_frame_hook(final_video)

            # Stage 6: Apply captions
            final_video = self.apply_captions(final_video)

            # Stage 7: Add sound effects
            final_video = self.apply_sfx(final_video)

            # Stage 8: Add ASMR layers
            final_video = self.add_asmr_layers(final_video)

            # Stage 9: Render final video optimized for TikTok
            logger.info("🎬 Rendering final video...")

            # Ensure output directory exists
            output_path = Path(output_path)
            output_path.parent.mkdir(parents=True, exist_ok=True)

            # TikTok-optimized render settings
            final_video.write_videofile(
                str(output_path),
                codec='libx264',
                audio_codec='aac',
                fps=60,  # High FPS for smooth viral content
                threads=4,
                preset='fast',  # Balance quality/speed
                ffmpeg_params=[
                    '-crf', '22',  # High quality
                    '-pix_fmt', 'yuv420p',  # Compatibility
                    '-movflags', '+faststart',  # Web optimization
                    '-vf', 'scale=1080:1920',  # TikTok vertical format
                ],
                verbose=False,
                logger=None
            )

            # Cleanup clips to free memory
            for clip in self.clips:
                clip.close()
            final_video.close()

            logger.info(f"✅ Video rendered successfully: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"❌ Processing failed: {e}")
            raise

def main():
    """Example usage of EditingAgent"""
    import argparse

    parser = argparse.ArgumentParser(description='AEON Editing Agent')
    parser.add_argument('--plan', required=True, help='Path to editing_plan.json')
    parser.add_argument('--output', default='output/viral_tiktok.mp4', help='Output video path')

    args = parser.parse_args()

    try:
        # Initialize and process
        agent = EditingAgent(args.plan)
        output_file = agent.process(args.output)

        print(f"🎉 Success! Video saved to: {output_file}")

    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
