"""
AEON AI Video Generation SaaS Platform - VisualGen Agent
Based on MIT-licensed ai-video-generator, restructured for 7-agent architecture
License: MIT (see LICENSE file)

Agent 2/7: VisualGen
- Takes 6 scene prompts from ScriptWriter
- Calls 6 Replicate models in parallel (Runway, Pika, Stable, Luma, Minimax, Kling)
- Downloads and validates all video results
- Returns scene URLs for Editor agent
"""

import os
import replicate
import asyncio
import aiohttp
import logging
from datetime import datetime
from typing import List, Dict, Any
from models import VisualGenRequest, VisualGenResponse
from database import db

logger = logging.getLogger(__name__)

class VisualGenAgent:
    def __init__(self):
        self.replicate_api_token = os.getenv("REPLICATE_API_TOKEN")
        if not self.replicate_api_token:
            raise ValueError("REPLICATE_API_TOKEN must be set")
        
        os.environ["REPLICATE_API_TOKEN"] = self.replicate_api_token
        self.agent_name = "visualgen"
        
        # 6 video generation models
        self.models = {
            "runway": "runway-ml/runway-gen3-alpha",
            "pika": "pika-labs/pika-1.0", 
            "stable": "stability-ai/stable-video-diffusion",
            "luma": "lumalabs/dream-machine",
            "minimax": "minimax/video-01",
            "kling": "kling-ai/kling-1.0"
        }
    
    async def generate_scenes(self, request: VisualGenRequest, video_id: str = None) -> Dict[str, Any]:
        """Generate video scenes using 6 parallel Replicate models"""
        agent_id = None
        
        try:
            # Create agent log
            if video_id:
                agent_id = await db.create_agent_log(
                    video_id=video_id,
                    agent_name=self.agent_name,
                    input_data={
                        "scenes": request.scenes,
                        "scene_count": len(request.scenes)
                    }
                )
                
                if agent_id:
                    await db.update_agent_log(agent_id, "running")
            
            # Generate all scenes in parallel
            scene_urls = []
            failed_scenes = []
            
            tasks = []
            for i, scene_prompt in enumerate(request.scenes):
                task = self._generate_single_scene(scene_prompt, i, video_id)
                tasks.append(task)
            
            # Wait for all scenes to complete
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"Scene {i} failed: {str(result)}")
                    failed_scenes.append(i)
                    scene_urls.append(None)
                elif result and result.get("success"):
                    scene_urls.append(result["url"])
                else:
                    failed_scenes.append(i)
                    scene_urls.append(None)
            
            # Filter out None values
            valid_scene_urls = [url for url in scene_urls if url is not None]
            
            # Update agent log with success
            if agent_id:
                await db.update_agent_log(
                    agent_id, 
                    "completed",
                    output_data={
                        "scene_urls": valid_scene_urls,
                        "failed_scenes": failed_scenes,
                        "success_rate": len(valid_scene_urls) / len(request.scenes)
                    }
                )
            
            success = len(valid_scene_urls) > 0
            message = f"Generated {len(valid_scene_urls)}/{len(request.scenes)} scenes"
            
            if failed_scenes:
                message += f". Failed scenes: {failed_scenes}"
            
            return VisualGenResponse(
                success=success,
                scene_urls=valid_scene_urls,
                failed_scenes=failed_scenes,
                message=message
            ).model_dump()
            
        except Exception as e:
            logger.error(f"VisualGen agent failed: {str(e)}")
            
            # Update agent log with error
            if agent_id:
                await db.update_agent_log(
                    agent_id, 
                    "failed",
                    error_message=str(e)
                )
            
            return {
                "success": False,
                "scene_urls": [],
                "failed_scenes": list(range(len(request.scenes))),
                "message": f"VisualGen failed: {str(e)}"
            }
    
    async def _generate_single_scene(self, prompt: str, scene_number: int, video_id: str = None) -> Dict[str, Any]:
        """Generate a single scene using model fallback strategy"""
        
        # Create scene record in database
        scene_id = None
        if video_id:
            scene_id = await db.create_video_scene(
                video_id=video_id,
                scene_number=scene_number + 1,
                model_name="ensemble",
                prompt=prompt
            )
        
        # Try each model in order until one succeeds
        for model_name, model_path in self.models.items():
            try:
                logger.info(f"Trying {model_name} for scene {scene_number}")
                
                # Update scene with current model
                if scene_id:
                    await db.update_video_scene(
                        scene_id,
                        "generating",
                        model_name=model_name,
                        started_at=datetime.utcnow().isoformat()
                    )
                
                # Generate with current model
                result = await self._call_replicate_model(model_path, prompt)
                
                if result and result.get("url"):
                    # Success - update scene record
                    if scene_id:
                        await db.update_video_scene(
                            scene_id,
                            "completed",
                            scene_url=result["url"],
                            duration=result.get("duration", 10.0),
                            replicate_prediction_id=result.get("prediction_id"),
                            model_output=result,
                            completed_at=datetime.utcnow().isoformat()
                        )
                    
                    return {
                        "success": True,
                        "url": result["url"],
                        "model": model_name,
                        "scene_number": scene_number
                    }
                
            except Exception as e:
                logger.error(f"Model {model_name} failed for scene {scene_number}: {str(e)}")
                continue
        
        # All models failed
        if scene_id:
            await db.update_video_scene(
                scene_id,
                "failed",
                error_message="All models failed",
                completed_at=datetime.utcnow().isoformat()
            )
        
        return {"success": False, "error": "All models failed"}
    
    async def _call_replicate_model(self, model_path: str, prompt: str) -> Dict[str, Any]:
        """Call a specific Replicate model"""
        try:
            # Prepare input based on model
            input_data = self._prepare_model_input(model_path, prompt)
            
            # Run the model
            output = await asyncio.to_thread(
                replicate.run,
                model_path,
                input=input_data
            )
            
            # Process output based on model
            return self._process_model_output(output, model_path)
            
        except Exception as e:
            logger.error(f"Replicate model {model_path} error: {str(e)}")
            raise e
    
    def _prepare_model_input(self, model_path: str, prompt: str) -> Dict[str, Any]:
        """Prepare input parameters for different models"""
        base_input = {
            "prompt": prompt,
            "duration": 10,  # 10 seconds per scene
            "aspect_ratio": "16:9",
            "quality": "high"
        }
        
        # Model-specific adjustments
        if "runway" in model_path:
            base_input.update({
                "model": "gen3a_turbo",
                "resolution": "1280x720"
            })
        elif "pika" in model_path:
            base_input.update({
                "fps": 24,
                "guidance_scale": 12
            })
        elif "stable" in model_path:
            base_input.update({
                "motion_bucket_id": 127,
                "noise_aug_strength": 0.02
            })
        elif "luma" in model_path:
            base_input.update({
                "loop": False,
                "aspect_ratio": "16:9"
            })
        elif "minimax" in model_path:
            base_input.update({
                "prompt_optimizer": True
            })
        elif "kling" in model_path:
            base_input.update({
                "creativity": 0.7,
                "duration": "10s"
            })
        
        return base_input
    
    def _process_model_output(self, output: Any, model_path: str) -> Dict[str, Any]:
        """Process output from different models into standard format"""
        try:
            url = None
            duration = 10.0
            
            if isinstance(output, str):
                url = output
            elif isinstance(output, list) and len(output) > 0:
                url = output[0] if isinstance(output[0], str) else output[0].get("url")
            elif isinstance(output, dict):
                url = output.get("url") or output.get("video_url") or output.get("output")
                duration = output.get("duration", 10.0)
            
            if not url:
                raise ValueError("No video URL in model output")
            
            return {
                "url": url,
                "duration": duration,
                "model": model_path,
                "raw_output": output
            }
            
        except Exception as e:
            logger.error(f"Error processing output from {model_path}: {str(e)}")
            raise e
    
    async def download_scene(self, url: str, scene_number: int) -> str:
        """Download a scene video and return local path"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        filename = f"scene_{scene_number}.mp4"
                        filepath = f"/tmp/{filename}"
                        
                        with open(filepath, 'wb') as f:
                            async for chunk in response.content.iter_chunked(8192):
                                f.write(chunk)
                        
                        return filepath
                    else:
                        raise Exception(f"Failed to download: HTTP {response.status}")
                        
        except Exception as e:
            logger.error(f"Download error for scene {scene_number}: {str(e)}")
            raise e
