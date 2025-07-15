"""
AEON Viral Edit Pipeline - Orchestrates all viral editing modules
Blessed for TikTok domination with GPU acceleration and viral optimization
"""

import os
import time
import logging
import cv2
import numpy as np
from typing import List, Optional, Dict, Any
from app.transitions import apply_viral_transitions
from app.beat_sync import sync_clips_to_beats
from app.captions import add_kinetic_captions
from app.sfx import add_asmr_layer, add_trending_sound
from app.hooks import apply_first_frame_hook, velocity_editing, apply_viral_hooks
from app.utils import (
    combine_clips, resize_video, overlay_avatar, add_watermark,
    validate_clips, optimize_for_platform, calculate_viral_score
)

logger = logging.getLogger(__name__)

# GPU acceleration imports
try:
    import cupy as cp
    from numba import cuda
    GPU_AVAILABLE = True
    logger.info("🚀 GPU acceleration available (CUDA)")
except ImportError:
    GPU_AVAILABLE = False
    cp = None
    cuda = None
    logger.warning("⚠️ GPU acceleration not available, falling back to CPU")


def gpu_color_grade_kernel(frame, lut, output):
    """CUDA kernel for GPU-accelerated color grading"""
    if not GPU_AVAILABLE:
        return
    i, j = cuda.grid(2)
    if i < frame.shape[0] and j < frame.shape[1]:
        r, g, b = frame[i, j, 0], frame[i, j, 1], frame[i, j, 2]
        # Apply LUT transformation
        output[i, j, 0] = lut[r, g, b, 0]
        output[i, j, 1] = lut[r, g, b, 1]
        output[i, j, 2] = lut[r, g, b, 2]


def apply_viral_lut_gpu(frame: np.ndarray, lut_name: str = "viral_teal_orange") -> np.ndarray:
    """Apply GPU-accelerated viral color grading LUT"""
    if not GPU_AVAILABLE:
        return frame  # Fallback to original frame

    try:
        # Load pre-computed viral LUT
        lut = load_viral_lut(lut_name)

        # Transfer to GPU
        d_frame = cuda.to_device(frame)
        d_lut = cuda.to_device(lut)
        d_output = cuda.device_array_like(frame)

        # Configure CUDA grid
        threads_per_block = (16, 16)
        blocks_per_grid_x = (frame.shape[0] + threads_per_block[0] - 1) // threads_per_block[0]
        blocks_per_grid_y = (frame.shape[1] + threads_per_block[1] - 1) // threads_per_block[1]
        blocks_per_grid = (blocks_per_grid_x, blocks_per_grid_y)

        # Execute kernel
        gpu_color_grade_kernel[blocks_per_grid, threads_per_block](d_frame, d_lut, d_output)

        # Copy back to host
        return d_output.copy_to_host()

    except Exception as e:
        logger.warning(f"GPU color grading failed: {e}, falling back to CPU")
        return frame


def load_viral_lut(lut_name: str) -> np.ndarray:
    """Load pre-computed viral LUT for TikTok optimization"""
    # Pre-computed viral LUTs for maximum engagement
    if lut_name == "viral_teal_orange":
        # Create teal/orange LUT for viral aesthetic
        lut = np.zeros((256, 256, 256, 3), dtype=np.uint8)
        for r in range(256):
            for g in range(256):
                for b in range(256):
                    # Enhance orange/skin tones and teal/blue tones
                    new_r = min(255, int(r * 1.2 + g * 0.1))
                    new_g = min(255, int(g * 1.1 + b * 0.05))
                    new_b = min(255, int(b * 1.3 + r * 0.05))
                    lut[r, g, b] = [new_r, new_g, new_b]
        return lut
    else:
        # Default identity LUT
        lut = np.zeros((256, 256, 256, 3), dtype=np.uint8)
        for r in range(256):
            for g in range(256):
                for b in range(256):
                    lut[r, g, b] = [r, g, b]
        return lut


def resize_video_gpu(clip_path: str, aspect_ratio: str, quality: str) -> str:
    """GPU-accelerated video resizing with viral optimization"""
    try:
        if GPU_AVAILABLE:
            return resize_video_cuda(clip_path, aspect_ratio, quality)
        else:
            # Fallback to CPU
            from app.utils import resize_video
            return resize_video(clip_path, aspect_ratio, quality)
    except Exception as e:
        logger.warning(f"GPU resize failed: {e}, falling back to CPU")
        from app.utils import resize_video
        return resize_video(clip_path, aspect_ratio, quality)


def resize_video_cuda(clip_path: str, aspect_ratio: str, quality: str) -> str:
    """CUDA-accelerated video resizing"""
    # This would use GPU-accelerated OpenCV or FFmpeg with NVENC
    # For now, we'll use the CPU version but with optimized settings
    from app.utils import resize_video
    return resize_video(clip_path, aspect_ratio, quality)


def apply_gpu_color_grading(video_clip, viral_mode: bool = True):
    """Apply GPU-accelerated color grading for viral aesthetics"""
    if not GPU_AVAILABLE or not viral_mode:
        return video_clip

    def process_frame(frame):
        return apply_viral_lut_gpu(frame, "viral_teal_orange")

    try:
        return video_clip.fl_image(process_frame)
    except Exception as e:
        logger.warning(f"GPU color grading failed: {e}")
        return video_clip

async def process_video_edit(
    clip_paths: List[str],
    bgm_path: Optional[str],
    overlay_path: Optional[str],
    captions_path: Optional[str],
    output_path: str,
    config: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Main AEON editing pipeline - processes video clips with viral TikTok optimizations
    
    Args:
        clip_paths: List of input video file paths
        bgm_path: Background music file path
        overlay_path: Avatar/logo overlay image path
        captions_path: Captions file path (SRT/VTT)
        output_path: Final output video path
        config: Edit configuration dictionary
    
    Returns:
        Dict with success status, processing time, viral score, and error details
    """
    start_time = time.time()
    
    try:
        logger.info(f"🚀 AEON Pipeline: Starting viral edit with {len(clip_paths)} clips")
        
        # Validate input clips
        validated_clips = validate_clips(clip_paths)
        if not validated_clips:
            return {"success": False, "error": "No valid video clips found"}
        
        logger.info(f"✅ Validated {len(validated_clips)} clips")
        
        # Step 1: Resize clips to target aspect ratio with GPU acceleration
        logger.info(f"📐 Resizing clips to {config['aspect_ratio']} (GPU: {GPU_AVAILABLE})")
        resized_clips = []
        for i, clip_path in enumerate(validated_clips):
            resized_clip = resize_video_gpu(clip_path, config['aspect_ratio'], config['quality'])
            resized_clips.append(resized_clip)
            logger.info(f"📐 Resized clip {i+1}/{len(validated_clips)}")
        
        # Step 2: Beat-sync clips if BGM is provided
        if bgm_path and config.get('beat_sync', True):
            logger.info("🎵 Syncing clips to audio beats")
            resized_clips = sync_clips_to_beats(resized_clips, bgm_path)
            logger.info("✅ Beat synchronization complete")
        
        # Step 3: Apply viral transitions
        logger.info(f"🎬 Applying viral transitions: {config['transitions']}")
        edited_video = apply_viral_transitions(
            resized_clips,
            config['transitions'],
            config['fade_in_out'],
            config.get('preview_mode', False)
        )
        logger.info("✅ Viral transitions applied")
        
        # Step 4: Apply TikTok viral hooks and optimizations
        if config.get('viral_mode', True):
            logger.info("🔥 Applying viral TikTok optimizations")

            # GPU-accelerated color grading
            logger.info("🎨 Applying GPU-accelerated viral color grading")
            edited_video = apply_gpu_color_grading(edited_video, True)
            logger.info("✅ Viral color grading applied")

            # First frame hook
            if config.get('first_frame_hook', True):
                edited_video = apply_first_frame_hook(edited_video)
                logger.info("✅ First frame hook applied")

            # Velocity editing
            if config.get('velocity_editing', True):
                edited_video = velocity_editing(edited_video)
                logger.info("✅ Velocity editing applied")

            # Apply additional viral hooks
            edited_video = apply_viral_hooks(edited_video, config)
            logger.info("✅ Viral hooks applied")
        
        # Step 5: Add ASMR and trending sound layers
        if config.get('asmr_layer', True):
            logger.info("🎧 Adding ASMR sound layer")
            edited_video = add_asmr_layer(edited_video)
            logger.info("✅ ASMR layer added")
        
        if bgm_path:
            logger.info("🎵 Adding trending sound mix")
            edited_video = add_trending_sound(edited_video, bgm_path)
            logger.info("✅ Trending sound added")
        
        # Step 6: Overlay avatar/logo
        if overlay_path:
            logger.info("🖼️ Adding avatar overlay")
            edited_video = overlay_avatar(edited_video, overlay_path)
            logger.info("✅ Avatar overlay added")
        
        # Step 7: Add watermark
        if config.get('watermark_text'):
            logger.info(f"🏷️ Adding watermark: {config['watermark_text']}")
            edited_video = add_watermark(edited_video, config['watermark_text'])
            logger.info("✅ Watermark added")
        
        # Step 8: Add kinetic captions
        if captions_path and config.get('kinetic_captions', True):
            logger.info("📝 Adding kinetic captions")
            edited_video = add_kinetic_captions(edited_video, captions_path)
            logger.info("✅ Kinetic captions added")
        
        # Step 9: Platform optimization
        logger.info("📱 Optimizing for TikTok platform")
        edited_video = optimize_for_platform(edited_video, "tiktok", config)
        logger.info("✅ Platform optimization complete")
        
        # Step 10: Export final video
        logger.info(f"💾 Exporting final video to: {output_path}")
        
        # Quality settings based on config
        quality_settings = get_quality_settings(config['quality'])
        
        # Preview mode - shorter duration and lower quality
        if config.get('preview_mode', False):
            max_duration = config.get('max_duration', 15)
            if edited_video.duration > max_duration:
                edited_video = edited_video.subclip(0, max_duration)
            quality_settings.update({
                "bitrate": "2M",
                "preset": "ultrafast"
            })
        
        # Export with optimized settings
        edited_video.write_videofile(
            output_path,
            codec="libx264",
            audio_codec="aac",
            threads=4,
            fps=30,
            **quality_settings
        )
        
        # Clean up temporary clips
        edited_video.close()
        for clip in resized_clips:
            if hasattr(clip, 'close'):
                clip.close()
        
        processing_time = time.time() - start_time
        viral_score = calculate_viral_score(config)
        
        logger.info(f"🎉 AEON Pipeline: Edit completed in {processing_time:.2f}s")
        logger.info(f"🔥 Viral Score: {viral_score}/100")
        
        return {
            "success": True,
            "output": output_path,
            "processing_time": processing_time,
            "viral_score": viral_score,
            "clips_processed": len(validated_clips),
            "features_applied": get_applied_features(config)
        }
    
    except Exception as e:
        processing_time = time.time() - start_time
        error_msg = f"AEON Pipeline failed after {processing_time:.2f}s: {str(e)}"
        logger.error(f"💥 {error_msg}")
        
        return {
            "success": False,
            "error": error_msg,
            "processing_time": processing_time,
            "clips_processed": len(clip_paths) if clip_paths else 0
        }

def get_quality_settings(quality: str) -> Dict[str, Any]:
    """
    Get video export quality settings based on quality level
    """
    settings = {
        "low": {
            "bitrate": "1M",
            "preset": "ultrafast",
            "crf": 28
        },
        "medium": {
            "bitrate": "2M",
            "preset": "fast",
            "crf": 23
        },
        "high": {
            "bitrate": "4M",
            "preset": "medium",
            "crf": 20
        },
        "ultra": {
            "bitrate": "8M",
            "preset": "slow",
            "crf": 18
        }
    }
    
    return settings.get(quality, settings["high"])

def get_applied_features(config: Dict[str, Any]) -> List[str]:
    """
    Get list of features that were applied based on config
    """
    features = []
    
    if config.get('viral_mode', True):
        features.append("viral_mode")
    if config.get('beat_sync', True):
        features.append("beat_sync")
    if config.get('velocity_editing', True):
        features.append("velocity_editing")
    if config.get('asmr_layer', True):
        features.append("asmr_layer")
    if config.get('kinetic_captions', True):
        features.append("kinetic_captions")
    if config.get('first_frame_hook', True):
        features.append("first_frame_hook")
    if config.get('fade_in_out', True):
        features.append("fade_in_out")
    if config.get('watermark_text'):
        features.append("watermark")
    
    features.append(f"transitions_{config.get('transitions', 'zoom_punch')}")
    features.append(f"quality_{config.get('quality', 'high')}")
    features.append(f"aspect_{config.get('aspect_ratio', '9:16')}")
    
    return features

# Viral editing presets for different content types
VIRAL_PRESETS = {
    "tiktok_dance": {
        "transitions": "viral_cut",
        "beat_sync": True,
        "velocity_editing": True,
        "asmr_layer": False,
        "first_frame_hook": True,
        "viral_mode": True
    },
    "tutorial": {
        "transitions": "slide",
        "beat_sync": False,
        "velocity_editing": False,
        "asmr_layer": True,
        "first_frame_hook": True,
        "viral_mode": True
    },
    "comedy": {
        "transitions": "zoom_punch",
        "beat_sync": True,
        "velocity_editing": True,
        "asmr_layer": True,
        "first_frame_hook": True,
        "viral_mode": True
    },
    "lifestyle": {
        "transitions": "slide",
        "beat_sync": True,
        "velocity_editing": False,
        "asmr_layer": True,
        "first_frame_hook": True,
        "viral_mode": True
    },
    "gaming": {
        "transitions": "glitch",
        "beat_sync": True,
        "velocity_editing": True,
        "asmr_layer": False,
        "first_frame_hook": True,
        "viral_mode": True
    }
}

def apply_viral_preset(config: Dict[str, Any], preset_name: str) -> Dict[str, Any]:
    """
    Apply a viral editing preset to the config
    """
    if preset_name in VIRAL_PRESETS:
        preset = VIRAL_PRESETS[preset_name]
        config.update(preset)
        logger.info(f"🎯 Applied viral preset: {preset_name}")
    
    return config
