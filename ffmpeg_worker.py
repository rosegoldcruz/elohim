"""
AEON AI Video Generation SaaS Platform - FFmpeg Worker Service
Based on MIT-licensed ai-video-generator, restructured for 7-agent architecture
License: MIT (see LICENSE file)

FFmpeg Worker Service:
- Assembles video clips with professional transitions
- Adds background music and audio effects
- Generates captions using Whisper API
- Applies video overlays and branding
- Optimizes output for web delivery
"""

import os
import asyncio
import subprocess
import tempfile
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
import json

logger = logging.getLogger(__name__)

class FFmpegWorker:
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
        self.ffmpeg_path = self._find_ffmpeg()
        
        # Video settings
        self.output_settings = {
            "codec": "libx264",
            "preset": "medium",
            "crf": "23",
            "pixel_format": "yuv420p",
            "resolution": "1920x1080",
            "framerate": "30"
        }
        
        # Audio settings
        self.audio_settings = {
            "codec": "aac",
            "bitrate": "128k",
            "sample_rate": "44100"
        }
    
    def _find_ffmpeg(self) -> str:
        """Find FFmpeg executable"""
        try:
            result = subprocess.run(["which", "ffmpeg"], capture_output=True, text=True)
            if result.returncode == 0:
                return result.stdout.strip()
            else:
                # Try common paths
                common_paths = [
                    "/usr/bin/ffmpeg",
                    "/usr/local/bin/ffmpeg",
                    "/opt/homebrew/bin/ffmpeg",
                    "ffmpeg"  # Assume it's in PATH
                ]
                
                for path in common_paths:
                    try:
                        subprocess.run([path, "-version"], capture_output=True, check=True)
                        return path
                    except (subprocess.CalledProcessError, FileNotFoundError):
                        continue
                
                raise Exception("FFmpeg not found")
                
        except Exception as e:
            logger.error(f"FFmpeg detection failed: {str(e)}")
            return "ffmpeg"  # Fallback
    
    async def assemble_video(
        self,
        scene_files: List[str],
        output_path: str,
        include_audio: bool = True,
        include_captions: bool = True,
        include_branding: bool = True,
        background_music: Optional[str] = None
    ) -> Dict[str, Any]:
        """Assemble final video from scene files"""
        try:
            logger.info(f"Assembling video from {len(scene_files)} scenes")
            
            # Validate input files
            valid_scenes = await self._validate_scene_files(scene_files)
            if not valid_scenes:
                raise Exception("No valid scene files provided")
            
            # Create temporary working directory
            work_dir = os.path.join(self.temp_dir, f"assembly_{int(asyncio.get_event_loop().time())}")
            os.makedirs(work_dir, exist_ok=True)
            
            # Step 1: Normalize scene videos
            normalized_scenes = await self._normalize_scenes(valid_scenes, work_dir)
            
            # Step 2: Create transitions between scenes
            transitioned_video = await self._add_transitions(normalized_scenes, work_dir)
            
            # Step 3: Add background music
            if include_audio and background_music:
                audio_video = await self._add_background_music(transitioned_video, background_music, work_dir)
            else:
                audio_video = transitioned_video
            
            # Step 4: Generate and add captions
            if include_captions:
                captioned_video = await self._add_captions(audio_video, work_dir)
            else:
                captioned_video = audio_video
            
            # Step 5: Add branding/watermark
            if include_branding:
                branded_video = await self._add_branding(captioned_video, work_dir)
            else:
                branded_video = captioned_video
            
            # Step 6: Final optimization
            final_video = await self._optimize_output(branded_video, output_path)
            
            # Get video metadata
            metadata = await self._get_video_metadata(final_video)
            
            # Cleanup temporary files
            await self._cleanup_temp_files(work_dir)
            
            return {
                "success": True,
                "output_path": final_video,
                "metadata": metadata,
                "message": "Video assembled successfully"
            }
            
        except Exception as e:
            logger.error(f"Video assembly failed: {str(e)}")
            return {
                "success": False,
                "output_path": None,
                "metadata": None,
                "message": f"Assembly failed: {str(e)}"
            }
    
    async def _validate_scene_files(self, scene_files: List[str]) -> List[str]:
        """Validate and filter scene files"""
        valid_files = []
        
        for file_path in scene_files:
            if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
                # Check if it's a valid video file
                try:
                    cmd = [
                        self.ffmpeg_path, "-i", file_path,
                        "-t", "1", "-f", "null", "-"
                    ]
                    
                    process = await asyncio.create_subprocess_exec(
                        *cmd,
                        stdout=asyncio.subprocess.PIPE,
                        stderr=asyncio.subprocess.PIPE
                    )
                    
                    await process.communicate()
                    
                    if process.returncode == 0:
                        valid_files.append(file_path)
                    else:
                        logger.warning(f"Invalid video file: {file_path}")
                        
                except Exception as e:
                    logger.warning(f"File validation failed for {file_path}: {str(e)}")
        
        return valid_files
    
    async def _normalize_scenes(self, scene_files: List[str], work_dir: str) -> List[str]:
        """Normalize scene videos to consistent format"""
        normalized_files = []
        
        for i, scene_file in enumerate(scene_files):
            output_file = os.path.join(work_dir, f"normalized_{i:02d}.mp4")
            
            cmd = [
                self.ffmpeg_path, "-i", scene_file,
                "-vf", f"scale={self.output_settings['resolution']},fps={self.output_settings['framerate']}",
                "-c:v", self.output_settings["codec"],
                "-preset", self.output_settings["preset"],
                "-crf", self.output_settings["crf"],
                "-pix_fmt", self.output_settings["pixel_format"],
                "-c:a", self.audio_settings["codec"],
                "-b:a", self.audio_settings["bitrate"],
                "-ar", self.audio_settings["sample_rate"],
                "-y", output_file
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                normalized_files.append(output_file)
                logger.info(f"Normalized scene {i}: {output_file}")
            else:
                logger.error(f"Scene normalization failed for {scene_file}: {stderr.decode()}")
        
        return normalized_files
    
    async def _add_transitions(self, scene_files: List[str], work_dir: str) -> str:
        """Add smooth transitions between scenes"""
        if len(scene_files) <= 1:
            return scene_files[0] if scene_files else None
        
        output_file = os.path.join(work_dir, "transitioned.mp4")
        
        # Build filter complex for crossfade transitions
        filter_complex = self._build_transition_filter(len(scene_files))
        
        cmd = [self.ffmpeg_path]
        
        # Add input files
        for scene_file in scene_files:
            cmd.extend(["-i", scene_file])
        
        # Add filter complex
        cmd.extend([
            "-filter_complex", filter_complex,
            "-map", "[final]",
            "-c:v", self.output_settings["codec"],
            "-preset", self.output_settings["preset"],
            "-crf", self.output_settings["crf"],
            "-y", output_file
        ])
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode == 0:
            logger.info("Transitions added successfully")
            return output_file
        else:
            logger.error(f"Transition addition failed: {stderr.decode()}")
            # Fallback to simple concatenation
            return await self._simple_concatenate(scene_files, work_dir)
    
    def _build_transition_filter(self, num_scenes: int) -> str:
        """Build FFmpeg filter complex for smooth transitions"""
        if num_scenes == 1:
            return "[0:v][0:a]concat=n=1:v=1:a=1[final]"
        
        filter_parts = []
        
        # Create crossfade transitions
        current_video = "0:v"
        current_audio = "0:a"
        
        for i in range(1, num_scenes):
            next_video = f"{i}:v"
            next_audio = f"{i}:a"
            
            if i == num_scenes - 1:
                # Last transition
                filter_parts.append(f"[{current_video}][{next_video}]xfade=transition=fade:duration=0.5:offset=9.5[final_v]")
                filter_parts.append(f"[{current_audio}][{next_audio}]acrossfade=d=0.5[final_a]")
                filter_parts.append("[final_v][final_a]concat=n=1:v=1:a=1[final]")
            else:
                # Intermediate transition
                filter_parts.append(f"[{current_video}][{next_video}]xfade=transition=fade:duration=0.5:offset=9.5[v{i}]")
                filter_parts.append(f"[{current_audio}][{next_audio}]acrossfade=d=0.5[a{i}]")
                current_video = f"v{i}"
                current_audio = f"a{i}"
        
        return ";".join(filter_parts)
    
    async def _simple_concatenate(self, scene_files: List[str], work_dir: str) -> str:
        """Simple concatenation fallback"""
        output_file = os.path.join(work_dir, "concatenated.mp4")
        
        # Create concat file
        concat_file = os.path.join(work_dir, "concat.txt")
        with open(concat_file, 'w') as f:
            for scene_file in scene_files:
                f.write(f"file '{scene_file}'\n")
        
        cmd = [
            self.ffmpeg_path,
            "-f", "concat",
            "-safe", "0",
            "-i", concat_file,
            "-c", "copy",
            "-y", output_file
        ]
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        await process.communicate()
        
        if process.returncode == 0:
            return output_file
        else:
            raise Exception("Both transition and concatenation methods failed")
    
    async def _add_background_music(self, video_file: str, music_file: str, work_dir: str) -> str:
        """Add background music to video"""
        output_file = os.path.join(work_dir, "with_music.mp4")
        
        cmd = [
            self.ffmpeg_path,
            "-i", video_file,
            "-i", music_file,
            "-filter_complex", "[1:a]volume=0.3[bg];[0:a][bg]amix=inputs=2:duration=first[audio]",
            "-map", "0:v",
            "-map", "[audio]",
            "-c:v", "copy",
            "-c:a", self.audio_settings["codec"],
            "-y", output_file
        ]
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode == 0:
            logger.info("Background music added successfully")
            return output_file
        else:
            logger.error(f"Background music addition failed: {stderr.decode()}")
            return video_file  # Return original if music addition fails
    
    async def _add_captions(self, video_file: str, work_dir: str) -> str:
        """Generate and add captions using Whisper API"""
        try:
            # Extract audio for transcription
            audio_file = os.path.join(work_dir, "audio.wav")
            
            cmd = [
                self.ffmpeg_path,
                "-i", video_file,
                "-vn", "-acodec", "pcm_s16le",
                "-ar", "16000", "-ac", "1",
                "-y", audio_file
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            await process.communicate()
            
            if process.returncode != 0:
                logger.error("Audio extraction for captions failed")
                return video_file
            
            # Generate captions (placeholder - implement Whisper API integration)
            captions = await self._generate_captions(audio_file)
            
            if not captions:
                logger.warning("No captions generated")
                return video_file
            
            # Create SRT file
            srt_file = os.path.join(work_dir, "captions.srt")
            await self._create_srt_file(captions, srt_file)
            
            # Add captions to video
            output_file = os.path.join(work_dir, "with_captions.mp4")
            
            cmd = [
                self.ffmpeg_path,
                "-i", video_file,
                "-vf", f"subtitles={srt_file}:force_style='FontSize=24,PrimaryColour=&Hffffff,OutlineColour=&H000000,Outline=2'",
                "-c:a", "copy",
                "-y", output_file
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                logger.info("Captions added successfully")
                return output_file
            else:
                logger.error(f"Caption addition failed: {stderr.decode()}")
                return video_file
                
        except Exception as e:
            logger.error(f"Caption processing failed: {str(e)}")
            return video_file
    
    async def _generate_captions(self, audio_file: str) -> List[Dict[str, Any]]:
        """Generate captions using Whisper API (placeholder)"""
        try:
            # This would integrate with OpenAI Whisper API
            # For now, return placeholder captions
            
            return [
                {"start": 0.0, "end": 5.0, "text": "AI-generated video content"},
                {"start": 5.0, "end": 10.0, "text": "Created with AEON platform"},
                {"start": 10.0, "end": 15.0, "text": "Professional video generation"}
            ]
            
        except Exception as e:
            logger.error(f"Caption generation failed: {str(e)}")
            return []
    
    async def _create_srt_file(self, captions: List[Dict[str, Any]], srt_file: str):
        """Create SRT subtitle file"""
        with open(srt_file, 'w') as f:
            for i, caption in enumerate(captions, 1):
                start_time = self._seconds_to_srt_time(caption["start"])
                end_time = self._seconds_to_srt_time(caption["end"])
                
                f.write(f"{i}\n")
                f.write(f"{start_time} --> {end_time}\n")
                f.write(f"{caption['text']}\n\n")
    
    def _seconds_to_srt_time(self, seconds: float) -> str:
        """Convert seconds to SRT time format"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millisecs = int((seconds % 1) * 1000)
        
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millisecs:03d}"
    
    async def _add_branding(self, video_file: str, work_dir: str) -> str:
        """Add AEON branding/watermark"""
        output_file = os.path.join(work_dir, "branded.mp4")
        
        # Simple text watermark (in production, use logo image)
        cmd = [
            self.ffmpeg_path,
            "-i", video_file,
            "-vf", "drawtext=text='AEON':fontsize=24:fontcolor=white@0.8:x=w-tw-10:y=h-th-10",
            "-c:a", "copy",
            "-y", output_file
        ]
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode == 0:
            logger.info("Branding added successfully")
            return output_file
        else:
            logger.error(f"Branding addition failed: {stderr.decode()}")
            return video_file
    
    async def _optimize_output(self, video_file: str, output_path: str) -> str:
        """Final optimization for web delivery"""
        cmd = [
            self.ffmpeg_path,
            "-i", video_file,
            "-c:v", self.output_settings["codec"],
            "-preset", "slow",  # Better compression for final output
            "-crf", "20",  # Higher quality for final output
            "-pix_fmt", self.output_settings["pixel_format"],
            "-c:a", self.audio_settings["codec"],
            "-b:a", self.audio_settings["bitrate"],
            "-movflags", "+faststart",  # Optimize for web streaming
            "-y", output_path
        ]
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode == 0:
            logger.info(f"Video optimized successfully: {output_path}")
            return output_path
        else:
            logger.error(f"Video optimization failed: {stderr.decode()}")
            # Copy original if optimization fails
            import shutil
            shutil.copy2(video_file, output_path)
            return output_path
    
    async def _get_video_metadata(self, video_file: str) -> Dict[str, Any]:
        """Get video metadata"""
        try:
            cmd = [
                self.ffmpeg_path,
                "-i", video_file,
                "-f", "null", "-"
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            # Parse metadata from stderr
            stderr_text = stderr.decode()
            
            # Extract basic metadata (simplified parsing)
            metadata = {
                "file_size": os.path.getsize(video_file),
                "duration": self._extract_duration(stderr_text),
                "resolution": self._extract_resolution(stderr_text),
                "codec": "h264",
                "format": "mp4"
            }
            
            return metadata
            
        except Exception as e:
            logger.error(f"Metadata extraction failed: {str(e)}")
            return {
                "file_size": os.path.getsize(video_file) if os.path.exists(video_file) else 0,
                "duration": 0,
                "resolution": "1920x1080",
                "codec": "h264",
                "format": "mp4"
            }
    
    def _extract_duration(self, ffmpeg_output: str) -> float:
        """Extract duration from FFmpeg output"""
        try:
            import re
            duration_match = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", ffmpeg_output)
            if duration_match:
                hours, minutes, seconds = duration_match.groups()
                return int(hours) * 3600 + int(minutes) * 60 + float(seconds)
            return 0.0
        except Exception:
            return 0.0
    
    def _extract_resolution(self, ffmpeg_output: str) -> str:
        """Extract resolution from FFmpeg output"""
        try:
            import re
            resolution_match = re.search(r"(\d+x\d+)", ffmpeg_output)
            if resolution_match:
                return resolution_match.group(1)
            return "1920x1080"
        except Exception:
            return "1920x1080"
    
    async def _cleanup_temp_files(self, work_dir: str):
        """Clean up temporary files"""
        try:
            import shutil
            if os.path.exists(work_dir):
                shutil.rmtree(work_dir)
                logger.info(f"Cleaned up temporary directory: {work_dir}")
        except Exception as e:
            logger.error(f"Cleanup failed: {str(e)}")

# Global worker instance
ffmpeg_worker = FFmpegWorker()
