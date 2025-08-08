"""
Media API - Upload and serve generated media assets
"""
from __future__ import annotations

import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()

MEDIA_ROOT = os.path.abspath(os.path.join(os.getcwd(), "media"))
os.makedirs(MEDIA_ROOT, exist_ok=True)


def safe_join(root: str, path: str) -> str:
    full = os.path.abspath(os.path.join(root, path))
    if not full.startswith(root):
        raise HTTPException(status_code=400, detail="Invalid path")
    return full


@router.post("/media/upload")
async def media_upload(file: UploadFile = File(...)):
    filename = file.filename
    if not filename:
        raise HTTPException(status_code=400, detail="Missing filename")
    dest = safe_join(MEDIA_ROOT, filename)
    content = await file.read()
    with open(dest, 'wb') as f:
        f.write(content)
    return { "url": f"/media/{filename}" }


@router.get("/media/{path:path}")
async def media_get(path: str):
    full = safe_join(MEDIA_ROOT, path)
    if not os.path.exists(full):
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(full)