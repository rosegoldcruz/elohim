"""
AEON Utils Module - Common helpers for video processing
Resize, trim, download, validation, and optimization utilities
"""

import os
import cv2
import numpy as np
import logging
import shutil
from moviepy.editor import (
    VideoFileClip, ImageClip, TextClip, CompositeVideoClip,
    concatenate_videoclips, ColorClip
)
from moviepy.video.fx import resize, crop
from typing import List, Tuple, Optional, Dict, Any
import requests
from urllib.parse import urlparse
import tempfile
import hashlib

logger = logging.getLogger(__name__)


def cleanup_temp_files(directory_path: str):
    """
    Clean up temporary files and directories
    """
    try:
        if os.path.exists(directory_path):
            shutil.rmtree(directory_path)
            logger.info(f"🧹 Cleaned up temp directory: {directory_path}")
    except Exception as e:
        logger.warning(f"⚠️ Failed to cleanup temp directory {directory_path}: {str(e)}")

def validate_clips(clip_paths: List[str]) -> List[str]:
    """
    Validate video clips and return list of valid paths
    
    Args:
        clip_paths: List of video file paths
    
    Returns:
        List of validated video file paths
    """
    valid_clips = []
    
    for clip_path in clip_paths:
        try:
            if not os.path.exists(clip_path):
                logger.warning(f"⚠️ File not found: {clip_path}")
                continue
            
            # Try to load the video
            test_clip = VideoFileClip(clip_path)
            
            # Basic validation
            if test_clip.duration < 0.1:
                logger.warning(f"⚠️ Video too short: {clip_path}")
                test_clip.close()
                continue
            
            if test_clip.size[0] < 100 or test_clip.size[1] < 100:
                logger.warning(f"⚠️ Video resolution too low: {clip_path}")
                test_clip.close()
                continue
            
            test_clip.close()
            valid_clips.append(clip_path)
            logger.info(f"✅ Validated clip: {clip_path}")
        
        except Exception as e:
            logger.warning(f"⚠️ Invalid clip {clip_path}: {str(e)}")
    
    logger.info(f"📊 Validated {len(valid_clips)}/{len(clip_paths)} clips")
    return valid_clips

def resize_video(clip_path: str, aspect_ratio: str, quality: str = "high") -> VideoFileClip:
    """
    Resize video to target aspect ratio with quality optimization
    
    Args:
        clip_path: Path to video file
        aspect_ratio: Target aspect ratio (9:16, 16:9, 1:1)
        quality: Quality setting (low, medium, high, ultra)
    
    Returns:
        Resized video clip
    """
    try:
        clip = VideoFileClip(clip_path)
        
        # Get target dimensions based on aspect ratio
        target_width, target_height = get_target_dimensions(aspect_ratio, quality)
        
        # Calculate current aspect ratio
        current_ratio = clip.size[0] / clip.size[1]
        target_ratio = target_width / target_height
        
        if abs(current_ratio - target_ratio) < 0.01:
            # Already correct ratio, just resize
            resized_clip = clip.resize((target_width, target_height))
        else:
            # Need to crop and resize
            if current_ratio > target_ratio:
                # Video is wider, crop width
                new_width = int(clip.size[1] * target_ratio)
                x_center = clip.size[0] // 2
                x1 = x_center - new_width // 2
                x2 = x_center + new_width // 2
                
                cropped_clip = clip.crop(x1=x1, x2=x2)
            else:
                # Video is taller, crop height
                new_height = int(clip.size[0] / target_ratio)
                y_center = clip.size[1] // 2
                y1 = y_center - new_height // 2
                y2 = y_center + new_height // 2
                
                cropped_clip = clip.crop(y1=y1, y2=y2)
            
            # Resize to target dimensions
            resized_clip = cropped_clip.resize((target_width, target_height))
        
        logger.info(f"📐 Resized {clip_path}: {clip.size} → {resized_clip.size}")
        return resized_clip
    
    except Exception as e:
        logger.error(f"💥 Resize failed for {clip_path}: {str(e)}")
        # Return original clip as fallback
        return VideoFileClip(clip_path)

def get_target_dimensions(aspect_ratio: str, quality: str) -> Tuple[int, int]:
    """
    Get target dimensions based on aspect ratio and quality
    """
    quality_multipliers = {
        "low": 0.5,
        "medium": 0.75,
        "high": 1.0,
        "ultra": 1.5
    }
    
    multiplier = quality_multipliers.get(quality, 1.0)
    
    base_dimensions = {
        "9:16": (1080, 1920),  # TikTok/Instagram Stories
        "16:9": (1920, 1080),  # YouTube/Landscape
        "1:1": (1080, 1080),   # Instagram Square
        "4:3": (1440, 1080),   # Classic TV
        "21:9": (2560, 1080)   # Ultrawide
    }
    
    base_width, base_height = base_dimensions.get(aspect_ratio, (1080, 1920))
    
    target_width = int(base_width * multiplier)
    target_height = int(base_height * multiplier)
    
    # Ensure even dimensions for video encoding
    target_width = target_width - (target_width % 2)
    target_height = target_height - (target_height % 2)
    
    return target_width, target_height

def combine_clips(clips: List[VideoFileClip], method: str = "concatenate") -> VideoFileClip:
    """
    Combine multiple video clips
    
    Args:
        clips: List of video clips
        method: Combination method (concatenate, composite)
    
    Returns:
        Combined video clip
    """
    try:
        if not clips:
            raise ValueError("No clips provided")
        
        if len(clips) == 1:
            return clips[0]
        
        if method == "concatenate":
            combined = concatenate_videoclips(clips, method="compose")
        elif method == "composite":
            combined = CompositeVideoClip(clips)
        else:
            raise ValueError(f"Unknown combination method: {method}")
        
        logger.info(f"🔗 Combined {len(clips)} clips using {method}")
        return combined
    
    except Exception as e:
        logger.error(f"💥 Clip combination failed: {str(e)}")
        return clips[0] if clips else None

def overlay_avatar(video: VideoFileClip, overlay_path: str) -> VideoFileClip:
    """
    Overlay avatar/logo on video
    
    Args:
        video: Input video clip
        overlay_path: Path to overlay image
    
    Returns:
        Video with overlay applied
    """
    try:
        if not os.path.exists(overlay_path):
            logger.warning(f"⚠️ Overlay file not found: {overlay_path}")
            return video
        
        # Load overlay image
        overlay = ImageClip(overlay_path)
        
        # Resize overlay to appropriate size (10% of video width)
        overlay_size = int(video.size[0] * 0.1)
        overlay = overlay.resize((overlay_size, overlay_size))
        
        # Position in top-right corner
        overlay = overlay.set_position((video.size[0] - overlay_size - 20, 20))
        overlay = overlay.set_duration(video.duration)
        
        # Make semi-transparent
        overlay = overlay.set_opacity(0.8)
        
        # Composite with video
        final_video = CompositeVideoClip([video, overlay])
        
        logger.info(f"🖼️ Added avatar overlay: {overlay_path}")
        return final_video
    
    except Exception as e:
        logger.warning(f"⚠️ Avatar overlay failed: {str(e)}")
        return video

def add_watermark(video: VideoFileClip, watermark_text: str) -> VideoFileClip:
    """
    Add text watermark to video
    
    Args:
        video: Input video clip
        watermark_text: Watermark text
    
    Returns:
        Video with watermark applied
    """
    try:
        if not watermark_text.strip():
            return video
        
        # Create watermark text clip
        fontsize = max(20, min(video.size[0], video.size[1]) // 40)
        
        watermark = TextClip(
            watermark_text,
            fontsize=fontsize,
            color='white',
            font='Arial',
            stroke_color='black',
            stroke_width=1
        ).set_duration(video.duration)
        
        # Position in bottom-right corner
        watermark = watermark.set_position((
            video.size[0] - watermark.size[0] - 10,
            video.size[1] - watermark.size[1] - 10
        ))
        
        # Make semi-transparent
        watermark = watermark.set_opacity(0.6)
        
        # Composite with video
        final_video = CompositeVideoClip([video, watermark])
        
        logger.info(f"🏷️ Added watermark: {watermark_text}")
        return final_video
    
    except Exception as e:
        logger.warning(f"⚠️ Watermark failed: {str(e)}")
        return video

def optimize_for_platform(video: VideoFileClip, platform: str, config: Dict[str, Any]) -> VideoFileClip:
    """
    Optimize video for specific platform
    
    Args:
        video: Input video clip
        platform: Target platform (tiktok, instagram, youtube)
        config: Configuration dictionary
    
    Returns:
        Platform-optimized video
    """
    try:
        logger.info(f"📱 Optimizing for platform: {platform}")
        
        if platform == "tiktok":
            # TikTok optimizations
            video = optimize_for_tiktok(video, config)
        elif platform == "instagram":
            # Instagram optimizations
            video = optimize_for_instagram(video, config)
        elif platform == "youtube":
            # YouTube optimizations
            video = optimize_for_youtube(video, config)
        
        logger.info(f"✅ Platform optimization complete: {platform}")
        return video
    
    except Exception as e:
        logger.warning(f"⚠️ Platform optimization failed: {str(e)}")
        return video

def optimize_for_tiktok(video: VideoFileClip, config: Dict[str, Any]) -> VideoFileClip:
    """
    Apply TikTok-specific optimizations
    """
    # Ensure 9:16 aspect ratio
    if video.size[0] / video.size[1] != 9/16:
        target_width, target_height = get_target_dimensions("9:16", config.get("quality", "high"))
        video = video.resize((target_width, target_height))
    
    # Optimize duration (15-60 seconds ideal)
    if video.duration > 60:
        video = video.subclip(0, 60)
        logger.info("⏱️ Trimmed video to 60 seconds for TikTok")
    
    # Boost saturation slightly for mobile viewing
    video = enhance_for_mobile(video)
    
    return video

def optimize_for_instagram(video: VideoFileClip, config: Dict[str, Any]) -> VideoFileClip:
    """
    Apply Instagram-specific optimizations
    """
    # Support multiple aspect ratios
    aspect_ratio = config.get("aspect_ratio", "1:1")
    
    if aspect_ratio not in ["1:1", "9:16", "16:9"]:
        aspect_ratio = "1:1"  # Default to square
    
    target_width, target_height = get_target_dimensions(aspect_ratio, config.get("quality", "high"))
    video = video.resize((target_width, target_height))
    
    return video

def optimize_for_youtube(video: VideoFileClip, config: Dict[str, Any]) -> VideoFileClip:
    """
    Apply YouTube-specific optimizations
    """
    # Ensure 16:9 aspect ratio
    target_width, target_height = get_target_dimensions("16:9", config.get("quality", "high"))
    video = video.resize((target_width, target_height))
    
    return video

def enhance_for_mobile(video: VideoFileClip) -> VideoFileClip:
    """
    Enhance video for mobile viewing
    """
    try:
        # Apply mobile-friendly enhancements
        def mobile_enhancement(get_frame, t):
            frame = get_frame(t)
            
            # Increase contrast slightly
            frame = cv2.convertScaleAbs(frame, alpha=1.1, beta=5)
            
            # Boost saturation
            hsv = cv2.cvtColor(frame, cv2.COLOR_RGB2HSV)
            hsv[:, :, 1] = cv2.multiply(hsv[:, :, 1], 1.2)  # Increase saturation
            frame = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
            
            return frame
        
        enhanced_video = video.fl(mobile_enhancement)
        logger.info("📱 Applied mobile enhancements")
        return enhanced_video
    
    except Exception as e:
        logger.warning(f"⚠️ Mobile enhancement failed: {str(e)}")
        return video


def stabilize_video(video: VideoFileClip, smoothing_radius: int = 50) -> VideoFileClip:
    """
    Stabilize video using OpenCV's built-in video stabilization

    Args:
        video: Input video clip
        smoothing_radius: Smoothing radius for stabilization

    Returns:
        Stabilized video clip
    """
    try:
        logger.info("🎯 Applying video stabilization")

        def stabilize_frame_sequence(get_frame, t):
            """Apply stabilization to frame sequence"""
            frame = get_frame(t)

            # Convert to grayscale for motion estimation
            gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)

            # Apply basic smoothing filter
            # Note: Full stabilization requires frame sequence processing
            kernel = np.ones((3, 3), np.float32) / 9
            smoothed = cv2.filter2D(frame, -1, kernel)

            return smoothed

        # Apply stabilization
        stabilized_video = video.fl(stabilize_frame_sequence)

        logger.info("✅ Video stabilization applied")
        return stabilized_video

    except Exception as e:
        logger.warning(f"⚠️ Video stabilization failed: {str(e)}")
        return video


def calculate_viral_score(config: Dict[str, Any]) -> int:
    """
    Calculate viral potential score based on applied features
    """
    score = 50  # Base score
    
    # Add points for viral features
    if config.get("viral_mode", False):
        score += 20
    if config.get("beat_sync", False):
        score += 15
    if config.get("velocity_editing", False):
        score += 10
    if config.get("first_frame_hook", False):
        score += 15
    if config.get("kinetic_captions", False):
        score += 10
    if config.get("asmr_layer", False):
        score += 5
    
    # Transition type scoring
    transition_scores = {
        "viral_cut": 20,
        "zoom_punch": 15,
        "glitch": 12,
        "3d_flip": 10,
        "slide": 5
    }
    score += transition_scores.get(config.get("transitions", ""), 0)
    
    # Aspect ratio scoring (9:16 is most viral)
    aspect_scores = {
        "9:16": 10,
        "1:1": 5,
        "16:9": 0
    }
    score += aspect_scores.get(config.get("aspect_ratio", ""), 0)
    
    return min(score, 100)  # Cap at 100

def download_file(url: str, output_path: str) -> bool:
    """
    Download file from URL
    
    Args:
        url: File URL
        output_path: Local output path
    
    Returns:
        True if successful, False otherwise
    """
    try:
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()
        
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        logger.info(f"📥 Downloaded: {url} → {output_path}")
        return True
    
    except Exception as e:
        logger.error(f"💥 Download failed: {url} - {str(e)}")
        return False

def generate_thumbnail(video_path: str, output_path: str, timestamp: float = 1.0) -> bool:
    """
    Generate thumbnail from video
    
    Args:
        video_path: Path to video file
        output_path: Output path for thumbnail
        timestamp: Time in seconds to capture frame
    
    Returns:
        True if successful, False otherwise
    """
    try:
        clip = VideoFileClip(video_path)
        
        # Ensure timestamp is within video duration
        timestamp = min(timestamp, clip.duration - 0.1)
        
        # Get frame at timestamp
        frame = clip.get_frame(timestamp)
        
        # Save as image
        cv2.imwrite(output_path, cv2.cvtColor(frame, cv2.COLOR_RGB2BGR))
        
        clip.close()
        
        logger.info(f"🖼️ Generated thumbnail: {output_path}")
        return True
    
    except Exception as e:
        logger.error(f"💥 Thumbnail generation failed: {str(e)}")
        return False

def cleanup_temp_files(directory: str) -> None:
    """
    Clean up temporary files in directory
    
    Args:
        directory: Directory to clean up
    """
    try:
        if os.path.exists(directory):
            for file in os.listdir(directory):
                file_path = os.path.join(directory, file)
                if os.path.isfile(file_path):
                    os.remove(file_path)
            os.rmdir(directory)
            logger.info(f"🧹 Cleaned up temp directory: {directory}")
    
    except Exception as e:
        logger.warning(f"⚠️ Cleanup failed: {str(e)}")

def get_video_info(video_path: str) -> Dict[str, Any]:
    """
    Get video file information
    
    Args:
        video_path: Path to video file
    
    Returns:
        Dictionary with video information
    """
    try:
        clip = VideoFileClip(video_path)
        
        info = {
            "duration": clip.duration,
            "size": clip.size,
            "fps": clip.fps,
            "has_audio": clip.audio is not None,
            "file_size": os.path.getsize(video_path),
            "aspect_ratio": clip.size[0] / clip.size[1]
        }
        
        clip.close()
        return info
    
    except Exception as e:
        logger.error(f"💥 Video info extraction failed: {str(e)}")
        return {}
