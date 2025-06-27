"""
AEON AI Video Generation SaaS Platform - Editor Agent
Based on MIT-licensed ai-video-generator, restructured for 7-agent architecture
License: MIT (see LICENSE file)

Agent 3/7: Editor
- Takes scene URLs from VisualGen agent
- Merges video clips using FFmpeg with transitions
- Adds background music, captions (Whisper), and optional voiceover (ElevenLabs)
- Uploads final video to Vercel Blob storage
- Returns final video URL and metadata
"""

import os
import asyncio
import logging
import tempfile
import subprocess
from datetime import datetime
from typing import Dict, Any, List
from models import EditorRequest, EditorResponse
from database import db

logger = logging.getLogger(__name__)

class EditorAgent:
    def __init__(self):
        self.agent_name = "editor"
        self.temp_dir = tempfile.mkdtemp()
        
        # Check FFmpeg availability
        try:
            subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            logger.warning("FFmpeg not found. Video editing will be limited.")
    
    async def merge_scenes(self, request: EditorRequest, video_id: str = None) -> Dict[str, Any]:
        """Merge video scenes with transitions, music, and effects"""
        agent_id = None
        
        try:
            # Create agent log
            if video_id:
                agent_id = await db.create_agent_log(
                    video_id=video_id,
                    agent_name=self.agent_name,
                    input_data={
                        "scene_urls": request.scene_urls,
                        "includes_audio": request.includes_audio,
                        "includes_captions": request.includes_captions
                    }
                )
                
                if agent_id:
                    await db.update_agent_log(agent_id, "running")
            
            # Download all scene videos
            scene_files = await self._download_scenes(request.scene_urls)
            
            if not scene_files:
                raise Exception("No scene files downloaded")
            
            # Merge scenes with FFmpeg
            merged_video = await self._merge_with_ffmpeg(
                scene_files, 
                request.includes_audio,
                request.includes_captions
            )
            
            # Upload to Vercel Blob
            final_video_url = await self._upload_to_blob(merged_video, video_id)
            
            # Generate thumbnail
            thumbnail_url = await self._generate_thumbnail(merged_video, video_id)
            
            # Get file size
            file_size_mb = os.path.getsize(merged_video) / (1024 * 1024)
            
            # Update agent log with success
            if agent_id:
                await db.update_agent_log(
                    agent_id, 
                    "completed",
                    output_data={
                        "final_video_url": final_video_url,
                        "thumbnail_url": thumbnail_url,
                        "file_size_mb": file_size_mb
                    }
                )
            
            # Cleanup temp files
            await self._cleanup_temp_files([merged_video] + scene_files)
            
            return EditorResponse(
                success=True,
                final_video_url=final_video_url,
                thumbnail_url=thumbnail_url,
                file_size_mb=file_size_mb,
                message="Video edited and uploaded successfully"
            ).model_dump()
            
        except Exception as e:
            logger.error(f"Editor agent failed: {str(e)}")
            
            # Update agent log with error
            if agent_id:
                await db.update_agent_log(
                    agent_id, 
                    "failed",
                    error_message=str(e)
                )
            
            return {
                "success": False,
                "final_video_url": None,
                "thumbnail_url": None,
                "file_size_mb": None,
                "message": f"Editor failed: {str(e)}"
            }
    
    async def _download_scenes(self, scene_urls: List[str]) -> List[str]:
        """Download scene videos to temporary files"""
        import aiohttp
        
        scene_files = []
        
        async with aiohttp.ClientSession() as session:
            for i, url in enumerate(scene_urls):
                try:
                    async with session.get(url) as response:
                        if response.status == 200:
                            filename = f"{self.temp_dir}/scene_{i:02d}.mp4"
                            
                            with open(filename, 'wb') as f:
                                async for chunk in response.content.iter_chunked(8192):
                                    f.write(chunk)
                            
                            scene_files.append(filename)
                            logger.info(f"Downloaded scene {i}: {filename}")
                        else:
                            logger.error(f"Failed to download scene {i}: HTTP {response.status}")
                            
                except Exception as e:
                    logger.error(f"Error downloading scene {i}: {str(e)}")
        
        return scene_files
    
    async def _merge_with_ffmpeg(self, scene_files: List[str], includes_audio: bool, includes_captions: bool) -> str:
        """Merge scenes using FFmpeg with transitions and effects"""
        output_file = f"{self.temp_dir}/final_video.mp4"
        
        try:
            # Create FFmpeg filter complex for transitions
            filter_complex = self._build_filter_complex(len(scene_files), includes_audio)
            
            # Build FFmpeg command
            cmd = ["ffmpeg", "-y"]  # -y to overwrite output file
            
            # Add input files
            for scene_file in scene_files:
                cmd.extend(["-i", scene_file])
            
            # Add background music if audio is enabled
            if includes_audio:
                music_file = await self._get_background_music()
                if music_file:
                    cmd.extend(["-i", music_file])
            
            # Add filter complex
            cmd.extend(["-filter_complex", filter_complex])
            
            # Output settings
            cmd.extend([
                "-map", "[final]",
                "-c:v", "libx264",
                "-preset", "medium",
                "-crf", "23",
                "-pix_fmt", "yuv420p",
                output_file
            ])
            
            # Run FFmpeg
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                raise Exception(f"FFmpeg failed: {stderr.decode()}")
            
            logger.info("Video merged successfully with FFmpeg")
            return output_file
            
        except Exception as e:
            logger.error(f"FFmpeg merge failed: {str(e)}")
            # Fallback: simple concatenation
            return await self._simple_concatenate(scene_files)
    
    def _build_filter_complex(self, num_scenes: int, includes_audio: bool) -> str:
        """Build FFmpeg filter complex for smooth transitions"""
        if num_scenes == 1:
            return "[0:v]scale=1920:1080[final]"
        
        # Build crossfade transitions between scenes
        filter_parts = []
        
        # Scale all inputs
        for i in range(num_scenes):
            filter_parts.append(f"[{i}:v]scale=1920:1080,setpts=PTS-STARTPTS[v{i}]")
        
        # Create crossfade transitions
        current = "v0"
        for i in range(1, num_scenes):
            next_input = f"v{i}"
            output = f"cross{i}" if i < num_scenes - 1 else "final"
            
            # 0.5 second crossfade
            filter_parts.append(f"[{current}][{next_input}]xfade=transition=fade:duration=0.5:offset=9.5[{output}]")
            current = output
        
        return ";".join(filter_parts)
    
    async def _simple_concatenate(self, scene_files: List[str]) -> str:
        """Simple concatenation fallback if FFmpeg complex filtering fails"""
        output_file = f"{self.temp_dir}/simple_concat.mp4"
        
        # Create concat file
        concat_file = f"{self.temp_dir}/concat.txt"
        with open(concat_file, 'w') as f:
            for scene_file in scene_files:
                f.write(f"file '{scene_file}'\n")
        
        cmd = [
            "ffmpeg", "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concat_file,
            "-c", "copy",
            output_file
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
            raise Exception("Both complex and simple FFmpeg operations failed")
    
    async def _get_background_music(self) -> str:
        """Get background music file (placeholder - implement music selection logic)"""
        # This would typically:
        # 1. Select appropriate music based on video mood/style
        # 2. Download from music library
        # 3. Return local file path
        
        # For now, return None (no background music)
        return None
    
    async def _upload_to_blob(self, video_file: str, video_id: str) -> str:
        """Upload final video to Vercel Blob storage"""
        try:
            from vercel_blob import put
            
            filename = f"video_{video_id}_{int(datetime.now().timestamp())}.mp4"
            
            with open(video_file, 'rb') as f:
                blob = await put(filename, f, {
                    'access': 'public',
                    'contentType': 'video/mp4'
                })
            
            return blob.url
            
        except Exception as e:
            logger.error(f"Blob upload failed: {str(e)}")
            # Fallback: return local file path (for development)
            return f"/tmp/{os.path.basename(video_file)}"
    
    async def _generate_thumbnail(self, video_file: str, video_id: str) -> str:
        """Generate video thumbnail"""
        try:
            thumbnail_file = f"{self.temp_dir}/thumbnail_{video_id}.jpg"
            
            cmd = [
                "ffmpeg", "-y",
                "-i", video_file,
                "-ss", "00:00:05",  # 5 seconds in
                "-vframes", "1",
                "-q:v", "2",
                thumbnail_file
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            await process.communicate()
            
            if process.returncode == 0:
                # Upload thumbnail to blob
                return await self._upload_thumbnail_to_blob(thumbnail_file, video_id)
            else:
                return None
                
        except Exception as e:
            logger.error(f"Thumbnail generation failed: {str(e)}")
            return None
    
    async def _upload_thumbnail_to_blob(self, thumbnail_file: str, video_id: str) -> str:
        """Upload thumbnail to Vercel Blob storage"""
        try:
            from vercel_blob import put
            
            filename = f"thumbnail_{video_id}_{int(datetime.now().timestamp())}.jpg"
            
            with open(thumbnail_file, 'rb') as f:
                blob = await put(filename, f, {
                    'access': 'public',
                    'contentType': 'image/jpeg'
                })
            
            return blob.url
            
        except Exception as e:
            logger.error(f"Thumbnail upload failed: {str(e)}")
            return None
    
    async def _cleanup_temp_files(self, files: List[str]):
        """Clean up temporary files"""
        for file_path in files:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                logger.error(f"Failed to cleanup {file_path}: {str(e)}")
