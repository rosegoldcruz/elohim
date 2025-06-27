from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import replicate

router = APIRouter()

class VisualGenInput(BaseModel):
    scenes: list[str]
    style: str

@router.post("/visualgen")
def generate_visuals(data: VisualGenInput):
    results = []
    try:
        for idx, scene in enumerate(data.scenes):
            model = "kling-v1.6-standard"
            output = replicate.run(f"kwaivgi/{model}", input={"prompt": scene})
            results.append({"scene": idx, "url": output[0]})
        return {"clips": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))