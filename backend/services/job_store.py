"""
Job Store Service - In-memory job tracking with pluggable backend
"""
from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Optional, List, Any


@dataclass
class JobRecord:
    job_id: str
    user_id: str
    status: str = "queued"  # queued|processing|generating|editing|validating|uploading|completed|failed|cancelled
    progress: float = 0.0
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    video_url: Optional[str] = None
    error: Optional[str] = None
    meta: Dict[str, Any] = field(default_factory=dict)


class InMemoryJobStore:
    def __init__(self) -> None:
        self._jobs: Dict[str, JobRecord] = {}
        self._lock = asyncio.Lock()

    async def create_job(self, job_id: str, user_id: str, meta: Dict[str, Any]) -> JobRecord:
        async with self._lock:
            record = JobRecord(job_id=job_id, user_id=user_id, status="queued", progress=0.0, meta=meta)
            self._jobs[job_id] = record
            return record

    async def get_job(self, job_id: str) -> Optional[JobRecord]:
        async with self._lock:
            return self._jobs.get(job_id)

    async def list_jobs_for_user(self, user_id: str, limit: int = 20, offset: int = 0) -> List[JobRecord]:
        async with self._lock:
            jobs = [j for j in self._jobs.values() if j.user_id == user_id]
            jobs.sort(key=lambda j: j.created_at, reverse=True)
            return jobs[offset: offset + limit]

    async def update_job(self, job_id: str, **updates) -> Optional[JobRecord]:
        async with self._lock:
            rec = self._jobs.get(job_id)
            if not rec:
                return None
            for k, v in updates.items():
                if hasattr(rec, k):
                    setattr(rec, k, v)
            rec.updated_at = datetime.utcnow()
            return rec

    async def set_status(self, job_id: str, status: str, progress: Optional[float] = None, error: Optional[str] = None):
        data: Dict[str, Any] = {"status": status}
        if progress is not None:
            data["progress"] = progress
        if error is not None:
            data["error"] = error
        return await self.update_job(job_id, **data)

    async def set_completed(self, job_id: str, video_url: str):
        return await self.update_job(job_id, status="completed", progress=100.0, video_url=video_url)


# Singleton instance for app
job_store = InMemoryJobStore()