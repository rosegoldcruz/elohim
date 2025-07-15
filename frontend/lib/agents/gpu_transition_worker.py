"""
AEON GPU Transition Worker - CUDA-accelerated video transitions
Handles beat-synced GPU transitions with FFmpeg fallback for viral video generation
"""

import asyncio
import logging
import numpy as np
import cv2
import subprocess
import tempfile
import os
from typing import Dict, List, Optional, Tuple, Union
from dataclasses import dataclass
from pathlib import Path
import json

# GPU acceleration imports
try:
    import cupy as cp
    from numba import cuda
    GPU_AVAILABLE = True
    logging.info("🚀 CUDA GPU acceleration available")
except ImportError:
    GPU_AVAILABLE = False
    cp = None
    cuda = None
    logging.warning("⚠️ CUDA not available, using CPU fallback")

logger = logging.getLogger(__name__)

@dataclass
class TransitionConfig:
    """Configuration for GPU transition rendering"""
    transition_id: str
    duration: float = 0.5
    intensity: float = 1.0
    beat_synced: bool = False
    sync_point: Optional[float] = None
    glsl_code: Optional[str] = None
    ffmpeg_params: Optional[Dict] = None
    viral_score: float = 5.0

@dataclass
class RenderResult:
    """Result of GPU transition rendering"""
    success: bool
    output_path: str
    processing_time_ms: int
    gpu_accelerated: bool
    frames_processed: int
    error_message: Optional[str] = None

class GPUTransitionEngine:
    """GPU-accelerated transition engine with CUDA support"""
    
    def __init__(self):
        self.cache = {}
        self.temp_dir = tempfile.mkdtemp(prefix="aeon_transitions_")
        self.gpu_available = GPU_AVAILABLE
        
        # Initialize CUDA context if available
        if self.gpu_available:
            try:
                cuda.select_device(0)
                logger.info("✅ CUDA device initialized")
            except Exception as e:
                logger.warning(f"CUDA initialization failed: {e}")
                self.gpu_available = False

    async def render(self, clip1_path: str, clip2_path: str, transition_config: TransitionConfig) -> RenderResult:
        """Main render function for GPU transitions"""
        start_time = asyncio.get_event_loop().time()
        
        try:
            # Load transition configuration
            transition = await self.load_transition(transition_config.transition_id)
            
            # Choose rendering method based on GPU availability
            if self.gpu_available and transition_config.transition_id in ['zoom_punch', 'glitch_blast', 'film_burn']:
                result = await self.render_gpu_transition(clip1_path, clip2_path, transition_config)
            else:
                result = await self.render_ffmpeg_transition(clip1_path, clip2_path, transition_config)
            
            processing_time = int((asyncio.get_event_loop().time() - start_time) * 1000)
            result.processing_time_ms = processing_time
            
            return result
            
        except Exception as e:
            logger.error(f"Transition rendering failed: {e}")
            return RenderResult(
                success=False,
                output_path="",
                processing_time_ms=int((asyncio.get_event_loop().time() - start_time) * 1000),
                gpu_accelerated=False,
                frames_processed=0,
                error_message=str(e)
            )

    async def render_gpu_transition(self, clip1_path: str, clip2_path: str, config: TransitionConfig) -> RenderResult:
        """Render transition using CUDA GPU acceleration"""
        if not self.gpu_available:
            return await self.render_ffmpeg_transition(clip1_path, clip2_path, config)
        
        try:
            # Extract frames from both clips
            frames1 = await self.extract_frames_gpu(clip1_path)
            frames2 = await self.extract_frames_gpu(clip2_path)
            
            # Apply GPU transition based on type
            if config.transition_id == 'zoom_punch':
                transition_frames = await self.apply_zoom_punch_gpu(frames1, frames2, config)
            elif config.transition_id == 'glitch_blast':
                transition_frames = await self.apply_glitch_blast_gpu(frames1, frames2, config)
            elif config.transition_id == 'film_burn':
                transition_frames = await self.apply_film_burn_gpu(frames1, frames2, config)
            else:
                # Fallback to crossfade
                transition_frames = await self.apply_crossfade_gpu(frames1, frames2, config)
            
            # Encode final video
            output_path = await self.encode_frames_gpu(transition_frames, config)
            
            return RenderResult(
                success=True,
                output_path=output_path,
                processing_time_ms=0,  # Will be set by caller
                gpu_accelerated=True,
                frames_processed=len(transition_frames)
            )
            
        except Exception as e:
            logger.warning(f"GPU rendering failed: {e}, falling back to FFmpeg")
            return await self.render_ffmpeg_transition(clip1_path, clip2_path, config)

    @cuda.jit
    def zoom_punch_kernel(self, frame1, frame2, output, progress, intensity, center_x, center_y):
        """CUDA kernel for zoom punch transition"""
        i, j = cuda.grid(2)
        if i < output.shape[0] and j < output.shape[1]:
            # Calculate distance from center
            dx = j - center_x
            dy = i - center_y
            distance = (dx * dx + dy * dy) ** 0.5
            
            # Zoom effect based on progress and distance
            zoom_factor = 1.0 + intensity * progress * (1.0 - distance / max(center_x, center_y))
            
            # Calculate source coordinates
            src_x = int(center_x + dx / zoom_factor)
            src_y = int(center_y + dy / zoom_factor)
            
            # Bounds checking and blending
            if 0 <= src_x < frame1.shape[1] and 0 <= src_y < frame1.shape[0]:
                alpha = min(1.0, progress * 2.0)
                for c in range(3):  # RGB channels
                    output[i, j, c] = (1 - alpha) * frame1[src_y, src_x, c] + alpha * frame2[i, j, c]
            else:
                # Use frame2 for out-of-bounds
                for c in range(3):
                    output[i, j, c] = frame2[i, j, c]

    @cuda.jit
    def glitch_blast_kernel(self, frame1, frame2, output, progress, intensity, noise_seed):
        """CUDA kernel for glitch blast transition"""
        i, j = cuda.grid(2)
        if i < output.shape[0] and j < output.shape[1]:
            # Generate pseudo-random noise
            noise = ((i * 1664525 + j * 1013904223 + noise_seed) % 2147483647) / 2147483647.0
            
            # RGB channel shifts for glitch effect
            shift_r = int(intensity * 10 * noise * progress)
            shift_g = int(intensity * 5 * noise * progress)
            shift_b = int(intensity * 15 * noise * progress)
            
            # Apply shifts with bounds checking
            r_idx = max(0, min(j + shift_r, output.shape[1] - 1))
            g_idx = j
            b_idx = max(0, min(j + shift_b, output.shape[1] - 1))
            
            # Blend based on progress and noise
            alpha = progress + noise * 0.3 if noise > 0.7 else progress
            alpha = max(0.0, min(1.0, alpha))
            
            output[i, j, 0] = (1 - alpha) * frame1[i, r_idx, 0] + alpha * frame2[i, j, 0]  # R
            output[i, j, 1] = (1 - alpha) * frame1[i, g_idx, 1] + alpha * frame2[i, j, 1]  # G
            output[i, j, 2] = (1 - alpha) * frame1[i, b_idx, 2] + alpha * frame2[i, j, 2]  # B

    async def apply_zoom_punch_gpu(self, frames1: List[np.ndarray], frames2: List[np.ndarray], config: TransitionConfig) -> List[np.ndarray]:
        """Apply zoom punch transition using GPU"""
        if not frames1 or not frames2:
            raise ValueError("Empty frame sequences")
        
        height, width = frames1[0].shape[:2]
        center_x, center_y = width // 2, height // 2
        
        # Calculate number of transition frames
        fps = 30  # Assume 30 FPS
        num_frames = int(config.duration * fps)
        transition_frames = []
        
        for i in range(num_frames):
            progress = i / (num_frames - 1) if num_frames > 1 else 1.0
            
            # Get source frames (loop if necessary)
            frame1 = frames1[min(i, len(frames1) - 1)]
            frame2 = frames2[min(i, len(frames2) - 1)]
            
            # Transfer to GPU
            d_frame1 = cuda.to_device(frame1.astype(np.float32))
            d_frame2 = cuda.to_device(frame2.astype(np.float32))
            d_output = cuda.device_array((height, width, 3), dtype=np.float32)
            
            # Configure CUDA grid
            threads_per_block = (16, 16)
            blocks_per_grid_x = (height + threads_per_block[0] - 1) // threads_per_block[0]
            blocks_per_grid_y = (width + threads_per_block[1] - 1) // threads_per_block[1]
            blocks_per_grid = (blocks_per_grid_x, blocks_per_grid_y)
            
            # Execute kernel
            self.zoom_punch_kernel[blocks_per_grid, threads_per_block](
                d_frame1, d_frame2, d_output, progress, config.intensity, center_x, center_y
            )
            
            # Copy back to host
            result_frame = d_output.copy_to_host().astype(np.uint8)
            transition_frames.append(result_frame)
        
        return transition_frames

    async def apply_glitch_blast_gpu(self, frames1: List[np.ndarray], frames2: List[np.ndarray], config: TransitionConfig) -> List[np.ndarray]:
        """Apply glitch blast transition using GPU"""
        if not frames1 or not frames2:
            raise ValueError("Empty frame sequences")
        
        height, width = frames1[0].shape[:2]
        fps = 30
        num_frames = int(config.duration * fps)
        transition_frames = []
        
        for i in range(num_frames):
            progress = i / (num_frames - 1) if num_frames > 1 else 1.0
            
            frame1 = frames1[min(i, len(frames1) - 1)]
            frame2 = frames2[min(i, len(frames2) - 1)]
            
            # Transfer to GPU
            d_frame1 = cuda.to_device(frame1.astype(np.float32))
            d_frame2 = cuda.to_device(frame2.astype(np.float32))
            d_output = cuda.device_array((height, width, 3), dtype=np.float32)
            
            # Configure CUDA grid
            threads_per_block = (16, 16)
            blocks_per_grid_x = (height + threads_per_block[0] - 1) // threads_per_block[0]
            blocks_per_grid_y = (width + threads_per_block[1] - 1) // threads_per_block[1]
            blocks_per_grid = (blocks_per_grid_x, blocks_per_grid_y)
            
            # Execute kernel with random seed
            noise_seed = hash(f"{i}_{config.transition_id}") % 2147483647
            self.glitch_blast_kernel[blocks_per_grid, threads_per_block](
                d_frame1, d_frame2, d_output, progress, config.intensity, noise_seed
            )
            
            # Copy back to host
            result_frame = d_output.copy_to_host().astype(np.uint8)
            transition_frames.append(result_frame)
        
        return transition_frames

    async def render_ffmpeg_transition(self, clip1_path: str, clip2_path: str, config: TransitionConfig) -> RenderResult:
        """Fallback FFmpeg-based transition rendering"""
        try:
            output_path = os.path.join(self.temp_dir, f"transition_{config.transition_id}_{os.getpid()}.mp4")
            
            # Build FFmpeg command based on transition type
            if config.transition_id == 'zoom_punch':
                cmd = self.build_zoom_punch_ffmpeg_cmd(clip1_path, clip2_path, output_path, config)
            elif config.transition_id == 'glitch_blast':
                cmd = self.build_glitch_ffmpeg_cmd(clip1_path, clip2_path, output_path, config)
            else:
                cmd = self.build_crossfade_ffmpeg_cmd(clip1_path, clip2_path, output_path, config)
            
            # Execute FFmpeg command
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                return RenderResult(
                    success=True,
                    output_path=output_path,
                    processing_time_ms=0,  # Will be set by caller
                    gpu_accelerated=False,
                    frames_processed=int(config.duration * 30)  # Estimate
                )
            else:
                raise Exception(f"FFmpeg failed: {stderr.decode()}")
                
        except Exception as e:
            logger.error(f"FFmpeg transition failed: {e}")
            return RenderResult(
                success=False,
                output_path="",
                processing_time_ms=0,
                gpu_accelerated=False,
                frames_processed=0,
                error_message=str(e)
            )

    def build_zoom_punch_ffmpeg_cmd(self, clip1: str, clip2: str, output: str, config: TransitionConfig) -> List[str]:
        """Build FFmpeg command for zoom punch transition"""
        return [
            'ffmpeg', '-y',
            '-i', clip1,
            '-i', clip2,
            '-filter_complex',
            f'[0:v]scale=1920:1080,zoompan=z=1+{config.intensity}*in/30:d=30*{config.duration}:s=1920x1080[v0];'
            f'[1:v]scale=1920:1080[v1];'
            f'[v0][v1]blend=all_mode=overlay:all_opacity={config.intensity}',
            '-t', str(config.duration),
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '23',
            output
        ]

    def build_glitch_ffmpeg_cmd(self, clip1: str, clip2: str, output: str, config: TransitionConfig) -> List[str]:
        """Build FFmpeg command for glitch transition"""
        return [
            'ffmpeg', '-y',
            '-i', clip1,
            '-i', clip2,
            '-filter_complex',
            f'[0:v]scale=1920:1080,rgbashift=rh={int(config.intensity*5)}:gh=0:bh={int(config.intensity*-3)}[v0];'
            f'[1:v]scale=1920:1080[v1];'
            f'[v0][v1]blend=all_mode=overlay:all_opacity=0.5',
            '-t', str(config.duration),
            '-c:v', 'libx264',
            '-preset', 'fast',
            output
        ]

    def build_crossfade_ffmpeg_cmd(self, clip1: str, clip2: str, output: str, config: TransitionConfig) -> List[str]:
        """Build FFmpeg command for crossfade transition"""
        return [
            'ffmpeg', '-y',
            '-i', clip1,
            '-i', clip2,
            '-filter_complex',
            f'[0:v][1:v]xfade=transition=fade:duration={config.duration}:offset=0',
            '-t', str(config.duration),
            '-c:v', 'libx264',
            '-preset', 'fast',
            output
        ]

    async def load_transition(self, transition_id: str) -> Dict:
        """Load transition configuration from cache or database"""
        if transition_id in self.cache:
            return self.cache[transition_id]
        
        # In production, this would load from Supabase
        # For now, return default configuration
        transition = {
            'id': transition_id,
            'name': transition_id.replace('_', ' ').title(),
            'glsl_code': '',
            'ffmpeg_params': {},
            'viral_score': 5.0
        }
        
        self.cache[transition_id] = transition
        return transition

    async def extract_frames_gpu(self, video_path: str) -> List[np.ndarray]:
        """Extract frames from video for GPU processing"""
        cap = cv2.VideoCapture(video_path)
        frames = []
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        finally:
            cap.release()
        
        return frames

    async def encode_frames_gpu(self, frames: List[np.ndarray], config: TransitionConfig) -> str:
        """Encode frames back to video using GPU-accelerated encoding if available"""
        output_path = os.path.join(self.temp_dir, f"gpu_transition_{config.transition_id}_{os.getpid()}.mp4")
        
        if not frames:
            raise ValueError("No frames to encode")
        
        height, width = frames[0].shape[:2]
        
        # Use GPU-accelerated encoding if available
        codec = 'h264_nvenc' if self.gpu_available else 'libx264'
        
        # Write frames to temporary files and use FFmpeg
        temp_pattern = os.path.join(self.temp_dir, f"frame_%04d.png")
        
        for i, frame in enumerate(frames):
            frame_path = temp_pattern % i
            cv2.imwrite(frame_path, cv2.cvtColor(frame, cv2.COLOR_RGB2BGR))
        
        cmd = [
            'ffmpeg', '-y',
            '-framerate', '30',
            '-i', temp_pattern,
            '-c:v', codec,
            '-preset', 'fast',
            '-crf', '23',
            '-pix_fmt', 'yuv420p',
            output_path
        ]
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        await process.communicate()
        
        # Clean up temporary frame files
        for i in range(len(frames)):
            frame_path = temp_pattern % i
            if os.path.exists(frame_path):
                os.unlink(frame_path)
        
        return output_path

    async def apply_crossfade_gpu(self, frames1: List[np.ndarray], frames2: List[np.ndarray], config: TransitionConfig) -> List[np.ndarray]:
        """Simple crossfade transition using GPU"""
        if not frames1 or not frames2:
            raise ValueError("Empty frame sequences")
        
        fps = 30
        num_frames = int(config.duration * fps)
        transition_frames = []
        
        for i in range(num_frames):
            progress = i / (num_frames - 1) if num_frames > 1 else 1.0
            
            frame1 = frames1[min(i, len(frames1) - 1)].astype(np.float32)
            frame2 = frames2[min(i, len(frames2) - 1)].astype(np.float32)
            
            # Simple alpha blending
            blended = (1 - progress) * frame1 + progress * frame2
            transition_frames.append(blended.astype(np.uint8))
        
        return transition_frames

    def __del__(self):
        """Cleanup temporary directory"""
        if hasattr(self, 'temp_dir') and os.path.exists(self.temp_dir):
            import shutil
            shutil.rmtree(self.temp_dir, ignore_errors=True)
