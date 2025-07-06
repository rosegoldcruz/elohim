"""
AEON Kinetic Captions Module - Bouncing, animated, viral TikTok captions
Uses MoviePy for text overlays with viral animation effects
"""

import re
import json
import logging
from moviepy.editor import (
    VideoFileClip, TextClip, CompositeVideoClip, ColorClip
)
from moviepy.video.fx import resize
import numpy as np
import math
from typing import List, Dict, Tuple, Optional

logger = logging.getLogger(__name__)

def add_kinetic_captions(video: VideoFileClip, captions_path: str) -> VideoFileClip:
    """
    Add kinetic/bouncing captions with viral TikTok animations
    
    Args:
        video: Input video clip
        captions_path: Path to captions file (SRT, VTT, or JSON)
    
    Returns:
        Video with animated captions overlay
    """
    try:
        logger.info(f"📝 Adding kinetic captions from: {captions_path}")
        
        # Parse captions file
        captions = parse_captions_file(captions_path)
        
        if not captions:
            logger.warning("⚠️ No captions found, returning original video")
            return video
        
        logger.info(f"📝 Parsed {len(captions)} caption segments")
        
        # Create animated caption clips
        caption_clips = []
        
        for i, caption in enumerate(captions):
            animated_clip = create_kinetic_caption_clip(
                caption['text'],
                caption['start'],
                caption['end'],
                video.size,
                animation_style=get_viral_animation_style(i, len(captions))
            )
            
            if animated_clip:
                caption_clips.append(animated_clip)
        
        if not caption_clips:
            logger.warning("⚠️ No caption clips created, returning original video")
            return video
        
        # Composite video with captions
        final_video = CompositeVideoClip([video] + caption_clips)
        
        logger.info(f"✅ Added {len(caption_clips)} kinetic caption segments")
        return final_video
    
    except Exception as e:
        logger.error(f"💥 Kinetic captions failed: {str(e)}")
        return video

def parse_captions_file(captions_path: str) -> List[Dict]:
    """
    Parse captions from SRT, VTT, or JSON file
    """
    try:
        with open(captions_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if captions_path.lower().endswith('.srt'):
            return parse_srt(content)
        elif captions_path.lower().endswith('.vtt'):
            return parse_vtt(content)
        elif captions_path.lower().endswith('.json'):
            return parse_json_captions(content)
        else:
            logger.warning(f"⚠️ Unsupported caption format: {captions_path}")
            return []
    
    except Exception as e:
        logger.error(f"💥 Caption parsing failed: {str(e)}")
        return []

def parse_srt(content: str) -> List[Dict]:
    """
    Parse SRT subtitle format
    """
    captions = []
    
    # SRT pattern: number, timestamp, text
    pattern = r'(\d+)\s*\n(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})\s*\n(.*?)(?=\n\d+\s*\n|\n*$)'
    
    matches = re.findall(pattern, content, re.DOTALL)
    
    for match in matches:
        start_time = srt_time_to_seconds(match[1])
        end_time = srt_time_to_seconds(match[2])
        text = match[3].strip().replace('\n', ' ')
        
        captions.append({
            'start': start_time,
            'end': end_time,
            'text': text
        })
    
    return captions

def parse_vtt(content: str) -> List[Dict]:
    """
    Parse VTT subtitle format
    """
    captions = []
    
    # VTT pattern
    pattern = r'(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})\s*\n(.*?)(?=\n\d{2}:\d{2}:\d{2}|\n*$)'
    
    matches = re.findall(pattern, content, re.DOTALL)
    
    for match in matches:
        start_time = vtt_time_to_seconds(match[0])
        end_time = vtt_time_to_seconds(match[1])
        text = match[2].strip().replace('\n', ' ')
        
        captions.append({
            'start': start_time,
            'end': end_time,
            'text': text
        })
    
    return captions

def parse_json_captions(content: str) -> List[Dict]:
    """
    Parse JSON caption format
    """
    try:
        data = json.loads(content)
        
        if isinstance(data, list):
            return data
        elif 'captions' in data:
            return data['captions']
        else:
            return []
    
    except json.JSONDecodeError:
        return []

def srt_time_to_seconds(time_str: str) -> float:
    """
    Convert SRT timestamp to seconds
    """
    time_str = time_str.replace(',', '.')
    parts = time_str.split(':')
    hours = int(parts[0])
    minutes = int(parts[1])
    seconds = float(parts[2])
    
    return hours * 3600 + minutes * 60 + seconds

def vtt_time_to_seconds(time_str: str) -> float:
    """
    Convert VTT timestamp to seconds
    """
    parts = time_str.split(':')
    hours = int(parts[0])
    minutes = int(parts[1])
    seconds = float(parts[2])
    
    return hours * 3600 + minutes * 60 + seconds

def create_kinetic_caption_clip(
    text: str,
    start_time: float,
    end_time: float,
    video_size: Tuple[int, int],
    animation_style: str = "bounce"
) -> Optional[TextClip]:
    """
    Create an animated caption clip with viral effects
    """
    try:
        duration = end_time - start_time
        
        if duration <= 0:
            return None
        
        # Split text into words for word-by-word animation
        words = text.split()
        
        if not words:
            return None
        
        # Create base text clip
        fontsize = get_optimal_fontsize(text, video_size)
        
        # Viral caption styling
        txt_clip = TextClip(
            text,
            fontsize=fontsize,
            color='white',
            font='Arial-Bold',
            stroke_color='black',
            stroke_width=3,
            method='caption',
            size=(video_size[0] * 0.9, None)
        ).set_duration(duration).set_start(start_time)
        
        # Apply animation based on style
        if animation_style == "bounce":
            txt_clip = apply_bounce_animation(txt_clip)
        elif animation_style == "typewriter":
            txt_clip = apply_typewriter_animation(txt_clip, text)
        elif animation_style == "zoom_in":
            txt_clip = apply_zoom_animation(txt_clip)
        elif animation_style == "slide_up":
            txt_clip = apply_slide_animation(txt_clip, video_size)
        elif animation_style == "highlight":
            txt_clip = apply_highlight_animation(txt_clip, text)
        elif animation_style == "word_pop":
            return create_word_pop_animation(words, start_time, duration, video_size)
        
        # Position caption (bottom center for TikTok style)
        txt_clip = txt_clip.set_position(('center', video_size[1] * 0.75))
        
        return txt_clip
    
    except Exception as e:
        logger.warning(f"⚠️ Caption clip creation failed: {str(e)}")
        return None

def apply_bounce_animation(clip: TextClip) -> TextClip:
    """
    Apply bouncing animation to text
    """
    def bounce_effect(t):
        # Bounce frequency and amplitude
        frequency = 3  # bounces per second
        amplitude = 10  # pixels
        
        bounce_offset = amplitude * abs(math.sin(2 * math.pi * frequency * t))
        return ('center', clip.pos(t)[1] - bounce_offset)
    
    return clip.set_position(bounce_effect)

def apply_typewriter_animation(clip: TextClip, text: str) -> TextClip:
    """
    Apply typewriter effect to text
    """
    def typewriter_effect(get_frame, t):
        progress = min(t / clip.duration, 1.0)
        chars_to_show = int(len(text) * progress)
        
        if chars_to_show == 0:
            # Return transparent frame
            frame = get_frame(0)
            frame = frame * 0  # Make transparent
            return frame
        
        # Create partial text
        partial_text = text[:chars_to_show]
        
        # Create new text clip for partial text
        partial_clip = TextClip(
            partial_text,
            fontsize=clip.fontsize,
            color=clip.color,
            font=clip.font,
            stroke_color=clip.stroke_color,
            stroke_width=clip.stroke_width
        ).set_duration(0.1)
        
        return partial_clip.get_frame(0)
    
    return clip.fl(typewriter_effect)

def apply_zoom_animation(clip: TextClip) -> TextClip:
    """
    Apply zoom-in animation to text
    """
    def zoom_effect(t):
        progress = min(t / 0.5, 1.0)  # Zoom in over first 0.5 seconds
        scale = 0.5 + 0.5 * progress  # Scale from 0.5 to 1.0
        return scale
    
    return clip.resize(zoom_effect)

def apply_slide_animation(clip: TextClip, video_size: Tuple[int, int]) -> TextClip:
    """
    Apply slide-up animation to text
    """
    def slide_effect(t):
        progress = min(t / 0.3, 1.0)  # Slide in over first 0.3 seconds
        start_y = video_size[1]  # Start from bottom
        end_y = video_size[1] * 0.75  # End at 75% down
        
        current_y = start_y + (end_y - start_y) * progress
        return ('center', current_y)
    
    return clip.set_position(slide_effect)

def apply_highlight_animation(clip: TextClip, text: str) -> TextClip:
    """
    Apply word-by-word highlight animation
    """
    words = text.split()
    word_duration = clip.duration / len(words)
    
    def highlight_effect(get_frame, t):
        current_word_index = int(t / word_duration)
        
        # Create highlighted text
        highlighted_words = []
        for i, word in enumerate(words):
            if i <= current_word_index:
                highlighted_words.append(f"<span color='yellow'>{word}</span>")
            else:
                highlighted_words.append(word)
        
        highlighted_text = " ".join(highlighted_words)
        
        # This is simplified - in practice, you'd need to render HTML-like markup
        return get_frame(t)
    
    return clip.fl(highlight_effect)

def create_word_pop_animation(
    words: List[str],
    start_time: float,
    duration: float,
    video_size: Tuple[int, int]
) -> CompositeVideoClip:
    """
    Create word-by-word pop animation
    """
    word_clips = []
    word_duration = duration / len(words)
    
    for i, word in enumerate(words):
        word_start = start_time + i * word_duration
        word_end = word_start + word_duration * 1.5  # Overlap words
        
        # Create individual word clip
        word_clip = TextClip(
            word,
            fontsize=get_optimal_fontsize(word, video_size),
            color='white',
            font='Arial-Bold',
            stroke_color='black',
            stroke_width=2
        ).set_duration(word_end - word_start).set_start(word_start)
        
        # Pop animation for each word
        def pop_effect(t, word_duration=word_duration):
            if t < 0.2:  # Pop in
                scale = 0.5 + 2.5 * (t / 0.2)  # Scale from 0.5 to 3.0
            elif t < 0.4:  # Settle
                scale = 3.0 - 2.0 * ((t - 0.2) / 0.2)  # Scale from 3.0 to 1.0
            else:  # Normal
                scale = 1.0
            return scale
        
        word_clip = word_clip.resize(pop_effect)
        
        # Position words horizontally
        x_position = (video_size[0] / len(words)) * i + (video_size[0] / len(words)) / 2
        word_clip = word_clip.set_position((x_position, video_size[1] * 0.75))
        
        word_clips.append(word_clip)
    
    return CompositeVideoClip(word_clips)

def get_optimal_fontsize(text: str, video_size: Tuple[int, int]) -> int:
    """
    Calculate optimal font size based on text length and video size
    """
    base_size = min(video_size[0], video_size[1]) // 20
    
    # Adjust based on text length
    if len(text) < 20:
        return int(base_size * 1.2)
    elif len(text) < 50:
        return base_size
    else:
        return int(base_size * 0.8)

def get_viral_animation_style(index: int, total: int) -> str:
    """
    Get viral animation style based on caption position
    """
    styles = ["bounce", "typewriter", "zoom_in", "slide_up", "highlight", "word_pop"]
    
    # First caption - always attention-grabbing
    if index == 0:
        return "zoom_in"
    
    # Last caption - memorable exit
    if index == total - 1:
        return "bounce"
    
    # Middle captions - vary the style
    return styles[index % len(styles)]

# Viral caption presets
VIRAL_CAPTION_PRESETS = {
    "tiktok_dance": {
        "primary_style": "word_pop",
        "secondary_style": "bounce",
        "color": "white",
        "stroke_color": "black",
        "position": "bottom"
    },
    "tutorial": {
        "primary_style": "typewriter",
        "secondary_style": "highlight",
        "color": "yellow",
        "stroke_color": "black",
        "position": "bottom"
    },
    "comedy": {
        "primary_style": "zoom_in",
        "secondary_style": "bounce",
        "color": "white",
        "stroke_color": "red",
        "position": "center"
    },
    "lifestyle": {
        "primary_style": "slide_up",
        "secondary_style": "typewriter",
        "color": "white",
        "stroke_color": "black",
        "position": "bottom"
    }
}
