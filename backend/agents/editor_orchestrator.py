"""
EditorRenderOrchestrator - render videos from timeline JSON (no external APIs)
"""
from __future__ import annotations

import os
import tempfile
import logging
from typing import Dict, Any, List
from moviepy.editor import VideoFileClip, AudioFileClip, TextClip, CompositeVideoClip, concatenate_videoclips

from services.job_store import job_store
from app.utils import get_target_dimensions
from app.transitions import apply_transition_sequence

logger = logging.getLogger(__name__)


class EditorRenderOrchestrator:
    async def run(self, job_id: str) -> None:
        rec = await job_store.get_job(job_id)
        if not rec:
            return
        try:
            await job_store.set_status(job_id, "processing", progress=5.0)
            timeline: Dict[str, Any] = rec.meta.get("timeline", {})
            settings: Dict[str, Any] = rec.meta.get("settings", {})

            width, height = get_target_dimensions(settings.get("aspect_ratio", "9:16"), settings.get("quality", "high"))

            tracks: List[Dict[str, Any]] = timeline.get("tracks", [])
            duration: float = float(timeline.get("duration", 60))

            # Build main video track clips
            main_track = next((t for t in tracks if t.get("type") == "video"), None)
            if not main_track:
                raise ValueError("Timeline missing video track")

            scene_clips: List[VideoFileClip] = []
            transitions: List[str] = []

            for i, clip in enumerate(sorted(main_track.get("clips", []), key=lambda c: c.get("startTime", 0))):
                src = clip.get("url")
                start = float(clip.get("startTime", 0))
                dur = float(clip.get("duration", 1))

                if not src or not os.path.exists(src):
                    # For now require local path; in production, download to temp
                    raise ValueError(f"Clip not found: {src}")

                v = VideoFileClip(src).subclip(0, min(dur, VideoFileClip(src).duration))
                v = v.resize((width, height))
                scene_clips.append(v)

                if i < len(main_track.get("clips", [])) - 1:
                    transitions.append((clip.get("transitions", {}) or {}).get("out", {}).get("type", "slide"))

            await job_store.set_status(job_id, "editing", progress=60.0)

            # Apply transitions sequence
            final = apply_transition_sequence(scene_clips, transitions or ["slide"]) if len(scene_clips) > 1 else scene_clips[0]

            # TODO: apply captions/text/audio/SFX overlays by scanning other tracks
            # For production, iterate text/audio/effects tracks and composite

            with tempfile.TemporaryDirectory() as tmp:
                out_path = os.path.join(tmp, f"{job_id}.mp4")
                final.write_videofile(out_path, codec="libx264", audio_codec="aac", fps=30, threads=4, verbose=False, logger=None)

                final_output = os.path.join(os.getcwd(), f"{job_id}.mp4")
                os.replace(out_path, final_output)

            await job_store.set_completed(job_id, final_output)
        except Exception as e:
            logger.exception(f"Editor render failed: {e}")
            await job_store.set_status(job_id, "failed", progress=100.0, error=str(e))
        finally:
            try:
                for c in locals().get("scene_clips", []):
                    c.close()
            except Exception:
                pass