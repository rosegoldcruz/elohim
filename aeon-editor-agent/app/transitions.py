"""
AEON Viral Transitions Library - GPU-accelerated viral video transitions
Blessed with TikTok-optimized effects: zoom punch, glitch, 3D flip, viral cuts
"""

import numpy as np
import cv2
import logging
from moviepy.editor import (
    VideoFileClip, concatenate_videoclips, CompositeVideoClip,
    vfx, afx, ColorClip, ImageClip
)
from moviepy.video.fx import resize, speedx, fadein, fadeout
from typing import List, Union
import random
import math

# GPU acceleration imports
try:
    import cupy as cp
    from numba import cuda
    GPU_AVAILABLE = True
except ImportError:
    GPU_AVAILABLE = False
    cp = None
    cuda = None

logger = logging.getLogger(__name__)


def glitch_effect_kernel(frame, output, time_factor, noise_seed):
    """CUDA kernel for real-time glitch effects"""
    if not GPU_AVAILABLE:
        return
    i, j = cuda.grid(2)
    if i < frame.shape[0] and j < frame.shape[1]:
        # RGB shift effect
        shift_r = int(5 * math.sin(time_factor * 20 + i * 0.1))
        shift_b = int(3 * math.cos(time_factor * 15 + j * 0.1))

        # Apply shifts with bounds checking
        r_idx = min(max(j + shift_r, 0), frame.shape[1] - 1)
        b_idx = min(max(j + shift_b, 0), frame.shape[1] - 1)

        output[i, j, 0] = frame[i, r_idx, 0]  # Red channel shifted
        output[i, j, 1] = frame[i, j, 1]      # Green channel normal
        output[i, j, 2] = frame[i, b_idx, 2]  # Blue channel shifted

        # Add scan lines
        if i % 5 == 0:
            output[i, j, 0] = int(output[i, j, 0] * 0.8)
            output[i, j, 1] = int(output[i, j, 1] * 0.8)
            output[i, j, 2] = int(output[i, j, 2] * 0.8)

        # Add block displacement
        block_size = 20
        if (i // block_size + j // block_size) % 2 == 0:
            displacement = int(10 * math.sin(time_factor * 30 + (i + j) * 0.05))
            displaced_j = min(max(j + displacement, 0), frame.shape[1] - 1)
            output[i, j, 0] = frame[i, displaced_j, 0]
            output[i, j, 1] = frame[i, displaced_j, 1]
            output[i, j, 2] = frame[i, displaced_j, 2]


def apply_gpu_glitch_effect(frame: np.ndarray, time_factor: float) -> np.ndarray:
    """Apply GPU-accelerated glitch effect to a frame"""
    if not GPU_AVAILABLE:
        return apply_cpu_glitch_effect(frame, time_factor)

    try:
        # Transfer to GPU
        d_frame = cuda.to_device(frame)
        d_output = cuda.device_array_like(frame)

        # Configure CUDA grid
        threads_per_block = (16, 16)
        blocks_per_grid_x = (frame.shape[0] + threads_per_block[0] - 1) // threads_per_block[0]
        blocks_per_grid_y = (frame.shape[1] + threads_per_block[1] - 1) // threads_per_block[1]
        blocks_per_grid = (blocks_per_grid_x, blocks_per_grid_y)

        # Execute kernel
        glitch_effect_kernel[blocks_per_grid, threads_per_block](
            d_frame, d_output, time_factor, random.randint(0, 1000)
        )

        # Copy back to host
        return d_output.copy_to_host()

    except Exception as e:
        logger.warning(f"GPU glitch effect failed: {e}, falling back to CPU")
        return apply_cpu_glitch_effect(frame, time_factor)


def apply_cpu_glitch_effect(frame: np.ndarray, time_factor: float) -> np.ndarray:
    """CPU fallback for glitch effect"""
    output = frame.copy()

    # RGB shift
    shift_r = int(5 * math.sin(time_factor * 20))
    shift_b = int(3 * math.cos(time_factor * 15))

    if shift_r > 0:
        output[:, shift_r:, 0] = frame[:, :-shift_r, 0]
    elif shift_r < 0:
        output[:, :shift_r, 0] = frame[:, -shift_r:, 0]

    if shift_b > 0:
        output[:, shift_b:, 2] = frame[:, :-shift_b, 2]
    elif shift_b < 0:
        output[:, :shift_b, 2] = frame[:, -shift_b:, 2]

    # Scan lines
    output[::5, :] = (output[::5, :] * 0.8).astype(np.uint8)

    return output


def perspective_transform_kernel(frame, output, transform_matrix):
    """CUDA kernel for 3D perspective transformation"""
    if not GPU_AVAILABLE:
        return
    i, j = cuda.grid(2)
    if i < output.shape[0] and j < output.shape[1]:
        # Apply perspective transformation
        x = j - output.shape[1] // 2
        y = i - output.shape[0] // 2

        # Transform coordinates
        new_x = int(transform_matrix[0, 0] * x + transform_matrix[0, 1] * y + transform_matrix[0, 2])
        new_y = int(transform_matrix[1, 0] * x + transform_matrix[1, 1] * y + transform_matrix[1, 2])

        # Add back center offset
        new_x += frame.shape[1] // 2
        new_y += frame.shape[0] // 2

        # Bounds checking
        if 0 <= new_x < frame.shape[1] and 0 <= new_y < frame.shape[0]:
            output[i, j, 0] = frame[new_y, new_x, 0]
            output[i, j, 1] = frame[new_y, new_x, 1]
            output[i, j, 2] = frame[new_y, new_x, 2]
        else:
            # Black background for out-of-bounds
            output[i, j, 0] = 0
            output[i, j, 1] = 0
            output[i, j, 2] = 0


def apply_gpu_3d_transform(frame: np.ndarray, angle: float, scale: float = 1.0) -> np.ndarray:
    """Apply GPU-accelerated 3D perspective transformation"""
    if not GPU_AVAILABLE:
        return apply_cpu_3d_transform(frame, angle, scale)

    try:
        # Create transformation matrix
        cos_a = math.cos(angle)
        sin_a = math.sin(angle)
        transform_matrix = np.array([
            [cos_a * scale, -sin_a * scale, 0],
            [sin_a * scale, cos_a * scale, 0],
            [0, 0, 1]
        ], dtype=np.float32)

        # Transfer to GPU
        d_frame = cuda.to_device(frame)
        d_transform = cuda.to_device(transform_matrix)
        d_output = cuda.device_array_like(frame)

        # Configure CUDA grid
        threads_per_block = (16, 16)
        blocks_per_grid_x = (frame.shape[0] + threads_per_block[0] - 1) // threads_per_block[0]
        blocks_per_grid_y = (frame.shape[1] + threads_per_block[1] - 1) // threads_per_block[1]
        blocks_per_grid = (blocks_per_grid_x, blocks_per_grid_y)

        # Execute kernel
        perspective_transform_kernel[blocks_per_grid, threads_per_block](
            d_frame, d_output, d_transform
        )

        # Copy back to host
        return d_output.copy_to_host()

    except Exception as e:
        logger.warning(f"GPU 3D transform failed: {e}, falling back to CPU")
        return apply_cpu_3d_transform(frame, angle, scale)


def apply_cpu_3d_transform(frame: np.ndarray, angle: float, scale: float = 1.0) -> np.ndarray:
    """CPU fallback for 3D transformation"""
    h, w = frame.shape[:2]
    center = (w // 2, h // 2)

    # Create rotation matrix
    rotation_matrix = cv2.getRotationMatrix2D(center, math.degrees(angle), scale)

    # Apply transformation
    transformed = cv2.warpAffine(frame, rotation_matrix, (w, h))

    return transformed


def apply_viral_transitions(
    clips: List[VideoFileClip],
    transition_type: str,
    fade_in_out: bool = True,
    preview_mode: bool = False
) -> VideoFileClip:
    """
    Apply viral transitions between video clips
    
    Args:
        clips: List of video clips
        transition_type: Type of transition to apply
        fade_in_out: Whether to apply fade in/out
        preview_mode: If True, use faster/simpler transitions
    
    Returns:
        Final video with transitions applied
    """
    logger.info(f"🎬 Applying {transition_type} transitions to {len(clips)} clips")
    
    if len(clips) == 0:
        raise ValueError("No clips provided")
    
    if len(clips) == 1:
        # Single clip - just apply fade if requested
        final_clip = clips[0]
        if fade_in_out:
            final_clip = final_clip.fadein(0.5).fadeout(0.5)
        return final_clip
    
    # Apply transitions between clips
    processed_clips = []
    
    for i in range(len(clips)):
        clip = clips[i]
        
        # Add the main clip
        if i == 0:
            # First clip - fade in if requested
            if fade_in_out:
                clip = clip.fadein(0.5)
        elif i == len(clips) - 1:
            # Last clip - fade out if requested
            if fade_in_out:
                clip = clip.fadeout(0.5)
        
        processed_clips.append(clip)
        
        # Add transition to next clip (except for last clip)
        if i < len(clips) - 1:
            next_clip = clips[i + 1]
            transition_clip = create_transition(
                clip, next_clip, transition_type, preview_mode
            )
            if transition_clip:
                processed_clips.append(transition_clip)
    
    # Concatenate all clips
    final_video = concatenate_videoclips(processed_clips, method="compose")
    
    logger.info(f"✅ Transitions applied - final duration: {final_video.duration:.2f}s")
    return final_video

def create_transition(
    clip1: VideoFileClip,
    clip2: VideoFileClip,
    transition_type: str,
    preview_mode: bool = False
) -> Union[VideoFileClip, None]:
    """
    Create a specific transition between two clips
    """
    duration = 0.3 if preview_mode else 0.5
    
    try:
        if transition_type == "zoom_punch":
            return zoom_punch_transition(clip1, clip2, duration)
        elif transition_type == "glitch":
            return glitch_transition(clip1, clip2, duration)
        elif transition_type == "slide":
            return slide_transition(clip1, clip2, duration)
        elif transition_type == "3d_flip":
            return flip_3d_transition(clip1, clip2, duration)
        elif transition_type == "viral_cut":
            return viral_cut_transition(clip1, clip2, duration)
        else:
            # Default to crossfade
            return crossfade_transition(clip1, clip2, duration)
    
    except Exception as e:
        logger.warning(f"⚠️ Transition failed, using crossfade: {str(e)}")
        return crossfade_transition(clip1, clip2, duration)

def zoom_punch_transition(clip1: VideoFileClip, clip2: VideoFileClip, duration: float) -> VideoFileClip:
    """
    Aggressive zoom punch transition - viral TikTok favorite
    """
    # Get last frame of clip1 and first frame of clip2
    end_frame = clip1.get_frame(clip1.duration - 0.1)
    start_frame = clip2.get_frame(0.1)
    
    # Create zoom punch effect
    punch_clip = ImageClip(end_frame, duration=duration)
    
    # Zoom in aggressively
    punch_clip = punch_clip.resize(lambda t: 1 + 0.5 * (t / duration))
    
    # Add shake effect
    def shake_effect(get_frame, t):
        frame = get_frame(t)
        if t < duration * 0.7:  # Shake for first 70% of transition
            shake_x = int(10 * math.sin(t * 50))
            shake_y = int(5 * math.cos(t * 60))
            # Apply shake by shifting frame
            h, w = frame.shape[:2]
            M = np.float32([[1, 0, shake_x], [0, 1, shake_y]])
            frame = cv2.warpAffine(frame, M, (w, h))
        return frame
    
    punch_clip = punch_clip.fl(shake_effect)
    
    # Fade to next clip
    next_start = ImageClip(start_frame, duration=duration * 0.3)
    next_start = next_start.fadein(duration * 0.3)
    
    # Composite the transition
    transition = CompositeVideoClip([punch_clip, next_start.set_start(duration * 0.7)])
    
    return transition

def glitch_transition(clip1: VideoFileClip, clip2: VideoFileClip, duration: float) -> VideoFileClip:
    """
    Digital glitch transition effect
    """
    # Get frames for glitch effect
    end_frame = clip1.get_frame(clip1.duration - 0.1)
    start_frame = clip2.get_frame(0.1)
    
    def glitch_effect(get_frame, t):
        progress = t / duration

        if progress < 0.5:
            frame = end_frame.copy()
        else:
            frame = start_frame.copy()

        # Apply GPU-accelerated glitch effect if available
        if GPU_AVAILABLE and random.random() < 0.5:  # 50% chance for GPU glitch
            return apply_gpu_glitch_effect(frame, progress)

        # Fallback to CPU glitch effects
        if random.random() < 0.3:  # 30% chance of glitch per frame
            h, w = frame.shape[:2]

            # RGB channel shift
            if random.random() < 0.5:
                shift = random.randint(5, 20)
                frame[:, :, 0] = np.roll(frame[:, :, 0], shift, axis=1)  # Red shift
                frame[:, :, 2] = np.roll(frame[:, :, 2], -shift, axis=1)  # Blue shift

            # Horizontal line glitches
            if random.random() < 0.4:
                for _ in range(random.randint(1, 5)):
                    y = random.randint(0, h - 10)
                    height = random.randint(2, 8)
                    shift = random.randint(-50, 50)
                    frame[y:y+height] = np.roll(frame[y:y+height], shift, axis=1)

            # Digital noise
            if random.random() < 0.3:
                noise = np.random.randint(0, 50, frame.shape, dtype=np.uint8)
                frame = cv2.addWeighted(frame, 0.8, noise, 0.2, 0)

        return frame
    
    glitch_clip = ColorClip(size=clip1.size, color=(0, 0, 0), duration=duration)
    glitch_clip = glitch_clip.fl(glitch_effect)
    
    return glitch_clip

def slide_transition(clip1: VideoFileClip, clip2: VideoFileClip, duration: float) -> VideoFileClip:
    """
    Smooth slide transition
    """
    # Get frames
    end_frame = clip1.get_frame(clip1.duration - 0.1)
    start_frame = clip2.get_frame(0.1)
    
    # Create sliding effect
    clip1_end = ImageClip(end_frame, duration=duration)
    clip2_start = ImageClip(start_frame, duration=duration)
    
    # Slide clip1 out to the left
    clip1_slide = clip1_end.set_position(lambda t: (-clip1.w * t / duration, 0))
    
    # Slide clip2 in from the right
    clip2_slide = clip2_start.set_position(lambda t: (clip2.w * (1 - t / duration), 0))
    
    # Composite the slides
    transition = CompositeVideoClip([clip1_slide, clip2_slide], size=clip1.size)
    
    return transition

def flip_3d_transition(clip1: VideoFileClip, clip2: VideoFileClip, duration: float) -> VideoFileClip:
    """
    3D cube flip transition effect
    """
    # Simplified 3D flip using perspective transformation
    end_frame = clip1.get_frame(clip1.duration - 0.1)
    start_frame = clip2.get_frame(0.1)
    
    def flip_effect(get_frame, t):
        progress = t / duration

        if progress < 0.5:
            # First half - flip out clip1 with GPU acceleration
            frame = end_frame.copy()
            angle = progress * math.pi  # 0 to π
            scale = 1 - (progress * 2)  # Scale from 1 to 0

            # Apply GPU-accelerated 3D transformation
            frame = apply_gpu_3d_transform(frame, angle, max(scale, 0.1))

        else:
            # Second half - flip in clip2 with GPU acceleration
            frame = start_frame.copy()
            angle = (progress - 0.5) * math.pi  # 0 to π
            scale = (progress - 0.5) * 2  # Scale from 0 to 1

            # Apply GPU-accelerated 3D transformation
            frame = apply_gpu_3d_transform(frame, angle, max(scale, 0.1))

        return frame
    
    flip_clip = ColorClip(size=clip1.size, color=(0, 0, 0), duration=duration)
    flip_clip = flip_clip.fl(flip_effect)
    
    return flip_clip

def viral_cut_transition(clip1: VideoFileClip, clip2: VideoFileClip, duration: float) -> VideoFileClip:
    """
    Ultra-fast viral cut with flash effect - maximum engagement
    """
    # Very short duration for viral cuts
    duration = min(duration, 0.2)
    
    # Create flash effect
    flash_color = (255, 255, 255)  # White flash
    flash_clip = ColorClip(size=clip1.size, color=flash_color, duration=duration)
    
    # Flash intensity curve (quick flash)
    def flash_intensity(t):
        # Peak at middle, fade to transparent
        progress = t / duration
        intensity = 1 - abs(progress - 0.5) * 2
        return max(0, intensity)
    
    flash_clip = flash_clip.set_opacity(flash_intensity)
    
    # Get transition frames
    end_frame = clip1.get_frame(clip1.duration - 0.1)
    start_frame = clip2.get_frame(0.1)
    
    # Quick cut between frames
    cut_point = duration * 0.5
    
    clip1_end = ImageClip(end_frame, duration=cut_point)
    clip2_start = ImageClip(start_frame, duration=duration - cut_point).set_start(cut_point)
    
    # Composite with flash
    transition = CompositeVideoClip([
        clip1_end,
        clip2_start,
        flash_clip
    ])
    
    return transition

def crossfade_transition(clip1: VideoFileClip, clip2: VideoFileClip, duration: float) -> VideoFileClip:
    """
    Simple crossfade transition (fallback)
    """
    end_frame = clip1.get_frame(clip1.duration - 0.1)
    start_frame = clip2.get_frame(0.1)
    
    clip1_end = ImageClip(end_frame, duration=duration).fadeout(duration)
    clip2_start = ImageClip(start_frame, duration=duration).fadein(duration)
    
    transition = CompositeVideoClip([clip1_end, clip2_start])
    
    return transition

# Viral transition presets for different content types
VIRAL_TRANSITION_PRESETS = {
    "high_energy": ["zoom_punch", "viral_cut", "glitch"],
    "smooth_flow": ["slide", "crossfade"],
    "dramatic": ["3d_flip", "zoom_punch"],
    "tech_gaming": ["glitch", "viral_cut"],
    "lifestyle": ["slide", "crossfade", "zoom_punch"]
}

def get_random_viral_transition(content_type: str = "high_energy") -> str:
    """
    Get a random viral transition based on content type
    """
    transitions = VIRAL_TRANSITION_PRESETS.get(content_type, ["zoom_punch"])
    return random.choice(transitions)

def apply_transition_sequence(clips: List[VideoFileClip], sequence: List[str]) -> VideoFileClip:
    """
    Apply a sequence of different transitions
    """
    if len(sequence) != len(clips) - 1:
        # Repeat sequence if needed
        sequence = (sequence * ((len(clips) - 1) // len(sequence) + 1))[:len(clips) - 1]
    
    processed_clips = [clips[0]]
    
    for i in range(len(clips) - 1):
        transition_type = sequence[i]
        transition = create_transition(clips[i], clips[i + 1], transition_type)
        if transition:
            processed_clips.append(transition)
        processed_clips.append(clips[i + 1])
    
    return concatenate_videoclips(processed_clips, method="compose")
