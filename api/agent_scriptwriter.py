"""
AEON AI Video Generation SaaS Platform - ScriptWriter Agent
Based on MIT-licensed ai-video-generator, restructured for 7-agent architecture
License: MIT (see LICENSE file)

Agent 1/7: ScriptWriter
- Accepts video topic input
- Uses OpenAI GPT-4 to generate 6 cinematic scene prompts
- Returns structured scene data for VisualGen agent
"""

import os
import openai
from typing import List, Dict, Any
import asyncio
import logging
from models import ScriptWriterRequest, ScriptWriterResponse
from database import db

logger = logging.getLogger(__name__)

class ScriptWriterAgent:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY must be set")
        
        openai.api_key = self.openai_api_key
        self.agent_name = "scriptwriter"
    
    async def generate_scenes(self, request: ScriptWriterRequest, video_id: str = None) -> Dict[str, Any]:
        """Generate 6 scene prompts from the main prompt"""
        agent_id = None
        
        try:
            # Create agent log
            if video_id:
                agent_id = await db.create_agent_log(
                    video_id=video_id,
                    agent_name=self.agent_name,
                    input_data={
                        "prompt": request.prompt,
                        "duration": request.duration,
                        "scene_count": request.scene_count
                    }
                )
                
                if agent_id:
                    await db.update_agent_log(agent_id, "running")
            
            # Calculate duration per scene
            duration_per_scene = request.duration / request.scene_count
            
            # Generate scene prompts using OpenAI
            scenes = await self._generate_scene_prompts(
                request.prompt, 
                request.scene_count, 
                duration_per_scene
            )
            
            # Update agent log with success
            if agent_id:
                await db.update_agent_log(
                    agent_id, 
                    "completed",
                    output_data={
                        "scenes": scenes,
                        "total_scenes": len(scenes),
                        "duration_per_scene": duration_per_scene
                    }
                )
            
            return ScriptWriterResponse(
                success=True,
                scenes=scenes,
                total_scenes=len(scenes),
                estimated_duration_per_scene=duration_per_scene
            ).model_dump()
            
        except Exception as e:
            logger.error(f"ScriptWriter agent failed: {str(e)}")
            
            # Update agent log with error
            if agent_id:
                await db.update_agent_log(
                    agent_id, 
                    "failed",
                    error_message=str(e)
                )
            
            return {
                "success": False,
                "scenes": [],
                "total_scenes": 0,
                "estimated_duration_per_scene": 0,
                "error": str(e)
            }
    
    async def _generate_scene_prompts(self, main_prompt: str, scene_count: int, duration_per_scene: float) -> List[str]:
        """Use OpenAI to generate scene prompts"""
        
        system_prompt = f"""You are a professional video scriptwriter for AI video generation. 
        
        Your task is to break down a main video concept into {scene_count} distinct scenes, each approximately {duration_per_scene:.1f} seconds long.
        
        Guidelines:
        - Each scene should be visually distinct and cinematic
        - Scenes should flow logically from one to the next
        - Use vivid, descriptive language that AI video models can interpret
        - Include camera angles, lighting, and mood descriptions
        - Each scene should be self-contained but part of the larger narrative
        - Focus on visual elements rather than dialogue
        - Make each scene prompt 2-3 sentences maximum
        
        Return ONLY the scene prompts, numbered 1-{scene_count}, with no additional text."""
        
        user_prompt = f"""Main video concept: "{main_prompt}"
        
        Please create {scene_count} scene prompts for this video concept."""
        
        try:
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            content = response.choices[0].message.content.strip()
            
            # Parse the numbered scenes
            scenes = []
            lines = content.split('\n')
            
            for line in lines:
                line = line.strip()
                if line and (line[0].isdigit() or line.startswith('Scene')):
                    # Remove numbering and clean up
                    scene = line
                    # Remove "1. " or "Scene 1:" prefixes
                    if '. ' in scene:
                        scene = scene.split('. ', 1)[1]
                    elif ':' in scene:
                        scene = scene.split(':', 1)[1].strip()
                    
                    if scene:
                        scenes.append(scene)
            
            # Ensure we have the right number of scenes
            if len(scenes) < scene_count:
                # If we don't have enough scenes, duplicate and modify the last one
                while len(scenes) < scene_count:
                    if scenes:
                        last_scene = scenes[-1]
                        modified_scene = f"{last_scene} (Alternative angle)"
                        scenes.append(modified_scene)
                    else:
                        # Fallback if no scenes were generated
                        scenes.append(f"Scene showing: {main_prompt}")
            
            # Trim to exact count if we have too many
            scenes = scenes[:scene_count]
            
            return scenes
            
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            
            # Fallback: Generate simple scenes based on the main prompt
            fallback_scenes = []
            for i in range(scene_count):
                scene_prompt = f"Scene {i+1}: {main_prompt} - Part {i+1} of {scene_count}"
                fallback_scenes.append(scene_prompt)
            
            return fallback_scenes
    
    async def validate_prompt(self, prompt: str) -> Dict[str, Any]:
        """Validate if a prompt is suitable for video generation"""
        try:
            validation_prompt = f"""Analyze this video prompt for AI video generation suitability:
            
            Prompt: "{prompt}"
            
            Rate from 1-10 and provide feedback on:
            1. Visual clarity (can AI models understand what to generate?)
            2. Feasibility (is this technically possible with current AI?)
            3. Content appropriateness (family-friendly, no harmful content?)
            
            Respond in JSON format:
            {{
                "score": 8,
                "visual_clarity": 9,
                "feasibility": 8,
                "appropriateness": 10,
                "feedback": "Clear and feasible prompt...",
                "suggestions": "Consider adding more specific details about..."
            }}"""
            
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": validation_prompt}],
                max_tokens=300,
                temperature=0.3
            )
            
            import json
            result = json.loads(response.choices[0].message.content)
            return {"success": True, "validation": result}
            
        except Exception as e:
            logger.error(f"Prompt validation error: {str(e)}")
            return {
                "success": False,
                "validation": {
                    "score": 5,
                    "feedback": "Could not validate prompt",
                    "error": str(e)
                }
            }
    
    async def enhance_prompt(self, prompt: str) -> str:
        """Enhance a basic prompt with more cinematic details"""
        try:
            enhancement_prompt = f"""Enhance this video prompt to be more cinematic and detailed for AI video generation:
            
            Original: "{prompt}"
            
            Add:
            - Specific camera angles and movements
            - Lighting and mood descriptions
            - Visual style and atmosphere
            - Color palette suggestions
            
            Keep it concise but vivid. Return only the enhanced prompt."""
            
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": enhancement_prompt}],
                max_tokens=200,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Prompt enhancement error: {str(e)}")
            return prompt  # Return original if enhancement fails
