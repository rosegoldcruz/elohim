"""
VideoJobOrchestrator - runs the end-to-end local pipeline with no paid APIs
"""
from __future__ import annotations

import os
import logging
import tempfile
from typing import List, Dict, Any
from moviepy.editor import ColorClip, VideoFileClip, concatenate_videoclips

from utils.config import get_settings
from services.job_store import job_store
from app.pipeline import process_video_edit

logger = logging.getLogger(__name__)


class VideoJobOrchestrator:
    def __init__(self, settings=None) -> None:
        self.settings = settings or get_settings()

    async def run(self, job_id: str) -> None:
        rec = await job_store.get_job(job_id)
        if not rec:
            return
        try:
            await job_store.set_status(job_id, "processing", progress=5.0)

            text: str = rec.meta.get("text", "")
            video_length: int = rec.meta.get("video_length", 30)
            scene_duration: int = rec.meta.get("scene_duration", 5)
            scene_count: int = max(1, video_length // scene_duration)

            # 1) SceneWriter: split into N scenes (simple equal split)
            await job_store.set_status(job_id, "processing", progress=10.0)
            scenes = self._split_text_into_scenes(text, scene_count, scene_duration)

            # 2) Model Dispatch: local generation → create placeholder color clips per scene
            await job_store.set_status(job_id, "generating", progress=25.0)
            scene_clips = self._generate_local_scene_clips(scenes, (1080, 1920))

            # 3) Validation
            await job_store.set_status(job_id, "validating", progress=40.0)
            for clip in scene_clips:
                if clip.duration <= 0:
                    raise ValueError("Invalid generated clip")

            # 4) EditPlan: simple plan based on style
            await job_store.set_status(job_id, "editing", progress=55.0)
            edit_config: Dict[str, Any] = {
                "aspect_ratio": "9:16",
                "quality": "high",
                "transitions": "slide",
                "fade_in_out": True,
                "viral_mode": True,
                "first_frame_hook": True,
                "velocity_editing": True,
                "kinetic_captions": True,
                "asmr_layer": False,
                "preview_mode": False,
            }

            # 5) Editing pipeline
            with tempfile.TemporaryDirectory() as tmpdir:
                output_path = os.path.join(tmpdir, f"{job_id}.mp4")

                # export intermediate concatenated clip for the pipeline input
                concat = concatenate_videoclips(scene_clips, method="compose")

                # Run pipeline on a list of paths; here we save the concat to a temp file first
                concat_path = os.path.join(tmpdir, "concat.mp4")
                concat.write_videofile(concat_path, codec="libx264", audio_codec="aac", fps=30, verbose=False, logger=None)
                concat.close()

                result = await self._run_pipeline([concat_path], None, None, None, output_path, edit_config)

                if not result.get("success"):
                    raise RuntimeError(result.get("error", "Editing failed"))

                final_path = os.path.join(os.getcwd(), f"{job_id}.mp4")
                # move file to working dir as final artifact
                os.replace(output_path, final_path)

            await job_store.set_completed(job_id, final_path)
            logger.info(f"Job {job_id} completed: {final_path}")
        except Exception as e:
            logger.exception(f"Job {job_id} failed: {e}")
            await job_store.set_status(job_id, "failed", progress=100.0, error=str(e))
        finally:
            # Close clips if needed
            try:
                for clip in locals().get("scene_clips", []):
                    clip.close()
            except Exception:
                pass

    async def _run_pipeline(
        self,
        clip_paths: List[str],
        bgm_path: str | None,
        overlay_path: str | None,
        captions_path: str | None,
        output_path: str,
        config: Dict[str, Any],
    ) -> Dict[str, Any]:
        return await process_video_edit(
            clip_paths=clip_paths,
            bgm_path=bgm_path,
            overlay_path=overlay_path,
            captions_path=captions_path,
            output_path=output_path,
            config=config,
        )

    def _split_text_into_scenes(self, text: str, n: int, duration: int) -> List[Dict[str, Any]]:
        sentences = [s.strip() for s in text.replace("\n", " ").split(".") if s.strip()]
        scenes: List[Dict[str, Any]] = []
        for i in range(n):
            prompt = sentences[i % len(sentences)] if sentences else f"Scene {i+1}"
            scenes.append({"scene": i + 1, "prompt": prompt, "duration": duration})
        return scenes

    def _generate_local_scene_clips(self, scenes: List[Dict[str, Any]], size: tuple[int, int]) -> List[ColorClip]:
        # Generate solid color clips per scene with subtle variation
        base_colors = [(30, 30, 30), (45, 35, 70), (20, 50, 80), (50, 20, 60), (60, 40, 30)]
        clips: List[ColorClip] = []
        for idx, scene in enumerate(scenes):
            color = base_colors[idx % len(base_colors)]
            clip = ColorClip(size=size, color=color, duration=float(scene["duration"]))
            clip = clip.set_fps(30)
            clips.append(clip)
        return clips