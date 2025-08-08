"""
Marketing API - Product video batch creator
"""
from __future__ import annotations

import uuid
import asyncio
import logging
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException
import httpx
from bs4 import BeautifulSoup

from utils.auth import verify_clerk_jwt
from services.job_store import job_store
from agents.orchestrator import VideoJobOrchestrator

logger = logging.getLogger(__name__)
router = APIRouter()


async def scrape_product(url: str) -> Dict:
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(url)
        r.raise_for_status()
    soup = BeautifulSoup(r.text, 'html.parser')

    title = soup.find('meta', property='og:title')
    title = title['content'] if title and title.get('content') else (soup.title.string if soup.title else 'Product')

    images = []
    for tag in soup.find_all('meta', property='og:image'):
        if tag.get('content'):
            images.append(tag['content'])

    bullets = []
    for li in soup.find_all('li'):
        text = (li.get_text() or '').strip()
        if 10 < len(text) < 200:
            bullets.append(text)
            if len(bullets) >= 8:
                break

    description_tag = soup.find('meta', attrs={'name': 'description'})
    description = description_tag['content'] if description_tag and description_tag.get('content') else ''

    return {
        'title': title,
        'images': images[:10],
        'bullets': bullets[:8],
        'description': description,
        'url': url,
    }


@router.post('/marketing/product-batch')
async def product_batch(url: str, variants: int = 3, current_user: dict = Depends(verify_clerk_jwt)):
    if variants < 1 or variants > 12:
        raise HTTPException(status_code=400, detail='variants must be 1-12')

    data = await scrape_product(url)
    text = f"{data['title']}\n\n" + "\n".join(data['bullets'] or [data['description']])

    jobs: List[str] = []
    for i in range(variants):
        job_id = uuid.uuid4().hex[:12]
        await job_store.create_job(job_id, current_user.get('user_id'), meta={
            'text': text,
            'video_length': 60,
            'scene_duration': 5,
            'scene_count': 12,
            'style': 'tiktok',
            'product': data,
            'variant': i + 1,
        })
        orchestrator = VideoJobOrchestrator()
        asyncio.create_task(orchestrator.run(job_id))
        jobs.append(job_id)

    return { 'jobs': jobs, 'scraped': data }