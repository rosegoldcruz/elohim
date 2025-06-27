from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from moviepy.editor import concatenate_videoclips, VideoFileClip, AudioFileClip, TextClip, CompositeVideoClip
import subprocess
import os

router = APIRouter()

class EditInput(BaseModel):
    clips: list[str]
    output_path: str
    intro_text: str = "Powered by AEON"
    outro_text: str = "www.aeoninvestmentstechnologies.com"
    background_audio: str = None

@router.post("/editor")
def edit_video(data: EditInput):
    try:
        video_clips = [VideoFileClip(c).resize(height=1080) for c in data.clips]

        # Add intro
        intro = TextClip(data.intro_text, fontsize=70, color='white', bg_color='black', size=(1920, 1080)).set_duration(3)
        outro = TextClip(data.outro_text, fontsize=70, color='white', bg_color='black', size=(1920, 1080)).set_duration(3)

        # Add crossfade transitions
        transitioned_clips = []
        for i in range(len(video_clips)):
            clip = video_clips[i]
            if i > 0:
                clip = clip.crossfadein(1)
            transitioned_clips.append(clip)

        final_clip = concatenate_videoclips([intro] + transitioned_clips + [outro], method='compose')

        # Add background audio if provided
        if data.background_audio:
            bg_audio = AudioFileClip(data.background_audio).volumex(0.3)
            final_clip = final_clip.set_audio(bg_audio.set_duration(final_clip.duration))

        temp_output = data.output_path.replace(".mp4", "_temp.mp4")
        final_clip.write_videofile(temp_output, codec="libx264", fps=24)

        # Final FFmpeg pass
        cmd = f"ffmpeg -i {temp_output} -c:v libx264 -preset fast -crf 23 -y {data.output_path}"
        subprocess.run(cmd, shell=True, check=True)
        os.remove(temp_output)

        return {"output_url": data.output_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))