from fastapi import APIRouter
from supabase import create_client
import os

router = APIRouter()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

@router.get("/dashboard/{email}")
def get_user_data(email: str):
    credits = supabase.table("credits").select("balance").eq("email", email).single().execute()
    videos = supabase.table("videos").select("status", "created_at", "url").eq("email", email).execute()
    return {"credits": credits.data, "videos": videos.data}