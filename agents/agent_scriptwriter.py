from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import openai

router = APIRouter()

class ScriptInput(BaseModel):
    topic: str
    style: str

@router.post("/scriptwriter")
def generate_script(data: ScriptInput):
    try:
        system_prompt = f"Break this video idea into 6 cinematic scenes in {data.style} style."
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": data.topic}
            ]
        )
        return {"scenes": response.choices[0].message.content.split("\n")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))