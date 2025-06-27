from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from uuid import uuid4

router = APIRouter()
job_queue = {}

class JobInput(BaseModel):
    email: str
    job_type: str
    payload: dict

@router.post("/schedule")
def schedule_job(data: JobInput, background_tasks: BackgroundTasks):
    job_id = str(uuid4())
    job_queue[job_id] = {"status": "queued", "payload": data.payload, "email": data.email}
    background_tasks.add_task(run_job, job_id)
    return {"job_id": job_id, "status": "queued"}

def run_job(job_id):
    job_queue[job_id]["status"] = "processing"
    # Simulate work...
    job_queue[job_id]["status"] = "complete"