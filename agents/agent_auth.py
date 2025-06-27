from fastapi import APIRouter, HTTPException
import requests, os

router = APIRouter()

@router.get("/auth/verify")
def verify_token(token: str):
    supabase_url = os.getenv("SUPABASE_URL")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{supabase_url}/auth/v1/user", headers=headers)
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=401, detail="Invalid token")