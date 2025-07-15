"""
Video processing engine for AEON
Handles viral video generation with AI-powered editing
"""

import os
import tempfile
import random
from typing import Dict, Any, List, Optional, Tuple
from moviepy.editor import *
from moviepy.video.fx import resize, fadein, fadeout
from moviepy.audio.fx import audio_fadein, audio_fadeout
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import cv2

from src.config import Config
from src.logger import JobLogger
from src.video_effects import VideoEffects


class ViralVideoProcessor:
    """AI-powered viral video processor"""
    
    def __init__(self, config: Config, job_logger: JobLogger):
        self.config = config
        self.logger = job_logger
        self.temp_dir = config.TEMP_DIR
        self.effects = VideoEffects(job_logger)

        # Viral video settings
        self.viral_effects = [
            "speed_ramp", "freeze_frame", "color_pop", "vignette",
            "chromatic_aberration", "film_grain", "neon_glow"
        ]
    
    async def process_video(self, job_data: Dict[str, Any]) -> str:
        """Process video based on job requirements"""
        self.logger.info("Starting video processing")
        
        try:
            # Extract job parameters
            input_data = job_data.get("input_data", {})
            style = input_data.get("style", "viral")
            duration = input_data.get("duration", 60)
            title = job_data.get("title", "AEON Video")
            description = job_data.get("description", "")
            
            self.logger.info(f"Processing {style} video, duration: {duration}s")
            
            # Generate base content
            clips = await self._generate_base_clips(title, description, duration)
            
            # Apply viral editing techniques
            if style == "viral":
                clips = await self._apply_viral_effects(clips)
            elif style == "cinematic":
                clips = await self._apply_cinematic_effects(clips)
            elif style == "casual":
                clips = await self._apply_casual_effects(clips)
            elif style == "professional":
                clips = await self._apply_professional_effects(clips)
            
            # Combine clips with transitions
            final_video = await self.effects.combine_clips_with_transitions(clips, duration)

            # Add audio
            final_video = await self.effects.add_audio(final_video, input_data.get("music_style", "upbeat"))

            # Add captions/text overlays
            final_video = await self.effects.add_text_overlays(final_video, title, description)

            # Export final video
            output_path = await self.effects.export_video(final_video, job_data["id"], self.temp_dir, self.config)
            
            self.logger.info(f"Video processing completed: {output_path}")
            return output_path
            
        except Exception as e:
            self.logger.error(f"Video processing failed: {e}")
            raise
    
    async def _generate_base_clips(self, title: str, description: str, duration: int) -> List[VideoClip]:
        """Generate base video clips"""
        self.logger.info("Generating base clips")
        
        clips = []
        
        # Create title card
        title_clip = await self._create_title_card(title, 3)
        clips.append(title_clip)
        
        # Create content clips based on description
        content_duration = duration - 6  # Reserve time for title and outro
        content_clips = await self._create_content_clips(description, content_duration)
        clips.extend(content_clips)
        
        # Create outro
        outro_clip = await self._create_outro_card(3)
        clips.append(outro_clip)
        
        return clips
    
    async def _create_title_card(self, title: str, duration: float) -> VideoClip:
        """Create animated title card"""
        width, height = self.config.get_resolution_dimensions()
        
        # Create background with gradient
        bg = ColorClip(size=(width, height), color=(0, 0, 0), duration=duration)
        
        # Add title text
        title_txt = TextClip(
            title,
            fontsize=80,
            color='white',
            font='Arial-Bold',
            size=(width-100, None),
            method='caption'
        ).set_duration(duration).set_position('center')
        
        # Add animation
        title_txt = title_txt.set_position(lambda t: ('center', height/2 - 50 + 20*np.sin(2*np.pi*t)))
        
        # Combine
        title_card = CompositeVideoClip([bg, title_txt])
        
        return title_card.fx(fadein, 0.5).fx(fadeout, 0.5)
    
    async def _create_content_clips(self, description: str, duration: float) -> List[VideoClip]:
        """Create content clips based on description"""
        clips = []
        
        # For now, create colorful animated backgrounds
        # In production, this would integrate with AI image/video generation
        
        num_clips = max(3, int(duration / 10))  # At least 3 clips
        clip_duration = duration / num_clips
        
        colors = [
            (255, 100, 100),  # Red
            (100, 255, 100),  # Green
            (100, 100, 255),  # Blue
            (255, 255, 100),  # Yellow
            (255, 100, 255),  # Magenta
            (100, 255, 255),  # Cyan
        ]
        
        width, height = self.config.get_resolution_dimensions()
        
        for i in range(num_clips):
            color = colors[i % len(colors)]
            
            # Create animated background
            bg = ColorClip(size=(width, height), color=color, duration=clip_duration)
            
            # Add some text from description
            words = description.split()
            if words:
                text = " ".join(words[i*3:(i+1)*3]) if len(words) > i*3 else description[:50]
                
                text_clip = TextClip(
                    text,
                    fontsize=60,
                    color='white',
                    font='Arial-Bold',
                    size=(width-200, None),
                    method='caption'
                ).set_duration(clip_duration).set_position('center')
                
                # Add text animation
                text_clip = text_clip.fx(fadein, 0.3).fx(fadeout, 0.3)
                
                clip = CompositeVideoClip([bg, text_clip])
            else:
                clip = bg
            
            clips.append(clip)
        
        return clips
    
    async def _create_outro_card(self, duration: float) -> VideoClip:
        """Create outro card"""
        width, height = self.config.get_resolution_dimensions()
        
        # Create background
        bg = ColorClip(size=(width, height), color=(20, 20, 20), duration=duration)
        
        # Add AEON logo/text
        logo_txt = TextClip(
            "AEON",
            fontsize=120,
            color='white',
            font='Arial-Bold'
        ).set_duration(duration).set_position('center')
        
        # Add subtitle
        subtitle_txt = TextClip(
            "AI-Powered Video Generation",
            fontsize=40,
            color='gray',
            font='Arial'
        ).set_duration(duration).set_position(('center', height/2 + 100))
        
        outro_card = CompositeVideoClip([bg, logo_txt, subtitle_txt])
        
        return outro_card.fx(fadein, 0.5).fx(fadeout, 0.5)
    
    async def _apply_viral_effects(self, clips: List[VideoClip]) -> List[VideoClip]:
        """Apply viral video effects"""
        self.logger.info("Applying viral effects")
        
        processed_clips = []
        
        for i, clip in enumerate(clips):
            # Apply random viral effects
            effect = random.choice(self.viral_effects)
            
            if effect == "speed_ramp":
                # Speed up middle section
                clip = clip.fx(speedx, lambda t: 1 + 0.5 * np.sin(2 * np.pi * t / clip.duration))
            elif effect == "freeze_frame":
                # Add freeze frame effect
                freeze_time = clip.duration * 0.7
                clip = clip.fx(freeze, t=freeze_time, freeze_duration=0.5)
            elif effect == "color_pop":
                # Enhance colors
                clip = clip.fx(colorx, 1.3)
            elif effect == "vignette":
                # Add vignette effect
                clip = clip.fx(mask_color, color=[0,0,0], thr=100, s=5)
            
            processed_clips.append(clip)
        
        return processed_clips
    
    async def _apply_cinematic_effects(self, clips: List[VideoClip]) -> List[VideoClip]:
        """Apply cinematic effects"""
        self.logger.info("Applying cinematic effects")
        
        processed_clips = []
        
        for clip in clips:
            # Add cinematic bars
            width, height = clip.size
            bar_height = int(height * 0.1)
            
            # Create black bars
            top_bar = ColorClip(size=(width, bar_height), color=(0,0,0)).set_duration(clip.duration)
            bottom_bar = ColorClip(size=(width, bar_height), color=(0,0,0)).set_duration(clip.duration)
            
            # Position bars
            top_bar = top_bar.set_position((0, 0))
            bottom_bar = bottom_bar.set_position((0, height - bar_height))
            
            # Composite
            cinematic_clip = CompositeVideoClip([clip, top_bar, bottom_bar])
            
            # Add color grading
            cinematic_clip = cinematic_clip.fx(colorx, 0.9)  # Slightly desaturated
            
            processed_clips.append(cinematic_clip)
        
        return processed_clips
    
    async def _apply_casual_effects(self, clips: List[VideoClip]) -> List[VideoClip]:
        """Apply casual/natural effects"""
        self.logger.info("Applying casual effects")
        
        # Minimal processing for casual style
        return [clip.fx(colorx, 1.1) for clip in clips]  # Slight color enhancement
    
    async def _apply_professional_effects(self, clips: List[VideoClip]) -> List[VideoClip]:
        """Apply professional effects"""
        self.logger.info("Applying professional effects")
        
        processed_clips = []
        
        for clip in clips:
            # Add subtle color correction
            clip = clip.fx(colorx, 1.05)
            
            # Add smooth fade transitions
            clip = clip.fx(fadein, 0.2).fx(fadeout, 0.2)
            
            processed_clips.append(clip)
        
        return processed_clips
