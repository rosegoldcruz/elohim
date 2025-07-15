"""
Storage operations for AEON Video Processing Agent
Handles file uploads to Vercel Blob Storage
"""

import os
import aiofiles
import httpx
from typing import Optional
from src.config import Config
from src.logger import get_logger

logger = get_logger("storage")


class BlobStorage:
    """Vercel Blob Storage client"""
    
    def __init__(self, config: Config):
        self.config = config
        self.token = config.BLOB_READ_WRITE_TOKEN
        self.base_url = "https://blob.vercel-storage.com"
    
    async def upload_file(self, file_path: str, filename: str) -> Optional[str]:
        """Upload file to Vercel Blob Storage"""
        try:
            # Read file content
            async with aiofiles.open(file_path, 'rb') as f:
                file_content = await f.read()
            
            # Prepare upload request
            headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/octet-stream"
            }
            
            # Upload to Vercel Blob
            async with httpx.AsyncClient() as client:
                response = await client.put(
                    f"{self.base_url}/{filename}",
                    headers=headers,
                    content=file_content,
                    timeout=300.0  # 5 minutes timeout for large files
                )
                
                if response.status_code == 200:
                    result = response.json()
                    url = result.get("url")
                    logger.info(f"Successfully uploaded {filename} to {url}")
                    return url
                else:
                    logger.error(f"Upload failed with status {response.status_code}: {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Failed to upload {filename}: {e}")
            return None
    
    async def upload_video(self, video_path: str, job_id: str) -> Optional[str]:
        """Upload processed video with job-specific filename"""
        filename = f"aeon-video-{job_id}.mp4"
        return await self.upload_file(video_path, filename)
    
    async def delete_file(self, url: str) -> bool:
        """Delete file from Vercel Blob Storage"""
        try:
            # Extract filename from URL
            filename = url.split("/")[-1]
            
            headers = {
                "Authorization": f"Bearer {self.token}"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    f"{self.base_url}/{filename}",
                    headers=headers
                )
                
                if response.status_code == 200:
                    logger.info(f"Successfully deleted {filename}")
                    return True
                else:
                    logger.error(f"Delete failed with status {response.status_code}: {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Failed to delete file {url}: {e}")
            return False


class LocalStorage:
    """Local file storage for development/testing"""
    
    def __init__(self, config: Config):
        self.config = config
        self.output_dir = config.OUTPUT_DIR
    
    async def upload_file(self, file_path: str, filename: str) -> Optional[str]:
        """Copy file to output directory and return local URL"""
        try:
            output_path = os.path.join(self.output_dir, filename)
            
            # Copy file
            async with aiofiles.open(file_path, 'rb') as src:
                async with aiofiles.open(output_path, 'wb') as dst:
                    content = await src.read()
                    await dst.write(content)
            
            # Return local file URL
            url = f"file://{output_path}"
            logger.info(f"File saved locally: {url}")
            return url
            
        except Exception as e:
            logger.error(f"Failed to save file locally: {e}")
            return None
    
    async def upload_video(self, video_path: str, job_id: str) -> Optional[str]:
        """Save video locally with job-specific filename"""
        filename = f"aeon-video-{job_id}.mp4"
        return await self.upload_file(video_path, filename)


def get_storage_client(config: Config):
    """Get appropriate storage client based on configuration"""
    if config.is_production and config.BLOB_READ_WRITE_TOKEN:
        return BlobStorage(config)
    else:
        logger.warning("Using local storage - not suitable for production")
        return LocalStorage(config)
