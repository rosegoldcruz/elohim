"""
Video effects and transitions for AEON viral video processing
"""

import numpy as np
from moviepy.editor import *
from moviepy.video.fx import resize, fadein, fadeout
from moviepy.audio.fx import audio_fadein, audio_fadeout
from typing import List
import os

from src.logger import JobLogger


class VideoEffects:
    """Video effects and transitions handler"""
    
    def __init__(self, job_logger: JobLogger):
        self.logger = job_logger
        
        self.viral_transitions = [
            "zoom_in", "zoom_out", "slide_left", "slide_right", 
            "fade", "spin", "shake", "glitch", "flash"
        ]
    
    async def combine_clips_with_transitions(self, clips: List[VideoClip], target_duration: float) -> VideoClip:
        """Combine clips with viral transitions"""
        self.logger.info("Combining clips with transitions")
        
        if not clips:
            raise ValueError("No clips to combine")
        
        # Add transitions between clips
        final_clips = []
        
        for i, clip in enumerate(clips):
            if i > 0:
                # Add transition effect
                import random
                transition = random.choice(self.viral_transitions)
                clip = await self.apply_transition(clip, transition)
            
            final_clips.append(clip)
        
        # Concatenate all clips
        final_video = concatenate_videoclips(final_clips, method="compose")
        
        # Adjust to target duration
        if final_video.duration > target_duration:
            final_video = final_video.subclip(0, target_duration)
        elif final_video.duration < target_duration:
            # Loop the video to reach target duration
            loops_needed = int(target_duration / final_video.duration) + 1
            final_video = concatenate_videoclips([final_video] * loops_needed).subclip(0, target_duration)
        
        return final_video
    
    async def apply_transition(self, clip: VideoClip, transition: str) -> VideoClip:
        """Apply transition effect to clip"""
        if transition == "zoom_in":
            return clip.fx(resize, lambda t: 1 + 0.1 * t / clip.duration)
        elif transition == "zoom_out":
            return clip.fx(resize, lambda t: 1.1 - 0.1 * t / clip.duration)
        elif transition == "fade":
            return clip.fx(fadein, 0.5)
        elif transition == "slide_left":
            return clip.set_position(lambda t: (-100 + 100 * t / clip.duration, 'center'))
        elif transition == "slide_right":
            return clip.set_position(lambda t: (100 - 100 * t / clip.duration, 'center'))
        else:
            return clip.fx(fadein, 0.3)
    
    async def add_audio(self, video: VideoClip, music_style: str) -> VideoClip:
        """Add background music based on style"""
        self.logger.info(f"Adding {music_style} audio")
        
        if music_style == "none":
            return video
        
        try:
            # Create a simple background tone
            from moviepy.audio.AudioClip import AudioClip
            
            def make_frame(t):
                # Simple sine wave based on music style
                if music_style == "upbeat":
                    freq = 440 + 100 * np.sin(2 * np.pi * t)
                elif music_style == "chill":
                    freq = 220 + 50 * np.sin(2 * np.pi * t * 0.5)
                elif music_style == "dramatic":
                    freq = 110 + 200 * np.sin(2 * np.pi * t * 0.3)
                else:
                    freq = 330
                
                return np.array([np.sin(2 * np.pi * freq * t) * 0.1])
            
            audio = AudioClip(make_frame, duration=video.duration)
            audio = audio.fx(audio_fadein, 1).fx(audio_fadeout, 1)
            
            return video.set_audio(audio)
            
        except Exception as e:
            self.logger.warning(f"Failed to add audio: {e}")
            return video
    
    async def add_text_overlays(self, video: VideoClip, title: str, description: str) -> VideoClip:
        """Add text overlays for viral appeal"""
        self.logger.info("Adding text overlays")
        
        try:
            # Add title overlay at the beginning
            title_overlay = TextClip(
                title,
                fontsize=50,
                color='white',
                stroke_color='black',
                stroke_width=2,
                font='Arial-Bold'
            ).set_duration(3).set_position(('center', 50))
            
            # Add description overlay in the middle
            if description and len(description) > 10:
                desc_text = description[:100] + "..." if len(description) > 100 else description
                desc_overlay = TextClip(
                    desc_text,
                    fontsize=30,
                    color='white',
                    stroke_color='black',
                    stroke_width=1,
                    font='Arial',
                    size=(video.w - 100, None),
                    method='caption'
                ).set_duration(5).set_position('center').set_start(video.duration / 2 - 2.5)
                
                return CompositeVideoClip([video, title_overlay, desc_overlay])
            else:
                return CompositeVideoClip([video, title_overlay])
                
        except Exception as e:
            self.logger.warning(f"Failed to add text overlays: {e}")
            return video
    
    async def export_video(self, video: VideoClip, job_id: str, temp_dir: str, config) -> str:
        """Export final video"""
        self.logger.info("Exporting final video")
        
        output_path = os.path.join(temp_dir, f"aeon_video_{job_id}.mp4")
        
        try:
            video.write_videofile(
                output_path,
                fps=config.DEFAULT_FPS,
                codec=config.VIDEO_CODEC,
                audio_codec=config.AUDIO_CODEC,
                bitrate=config.VIDEO_BITRATE,
                audio_bitrate=config.AUDIO_BITRATE,
                temp_audiofile=os.path.join(temp_dir, f"temp_audio_{job_id}.m4a"),
                remove_temp=True,
                verbose=False,
                logger=None
            )
            
            self.logger.info(f"Video exported successfully: {output_path}")
            return output_path
            
        except Exception as e:
            self.logger.error(f"Failed to export video: {e}")
            raise
        finally:
            # Clean up video object
            video.close()
