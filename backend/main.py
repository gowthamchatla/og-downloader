from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from celery import Celery
import yt_dlp
import subprocess
import os
import uuid
import json
from pathlib import Path
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="https://564dafb2f6af6d74af92222d918cbdeb@o4511279339208704.ingest.us.sentry.io/4511279345696768",
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,
)

# ─── Celery Setup ───────────────────────────────────────────────
celery_app = Celery(
    "tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
)

# ─── FastAPI Setup ──────────────────────────────────────────────
app = FastAPI(title="OG Downloader API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DOWNLOAD_DIR = Path("downloads")
DOWNLOAD_DIR.mkdir(exist_ok=True)


# ─── Models ─────────────────────────────────────────────────────
class VideoRequest(BaseModel):
    url: str
    quality: str = "best"


class TrimRequest(BaseModel):
    filename: str
    start: str
    end: str


# ─── Helpers ────────────────────────────────────────────────────
def cleanup_file(path: str, delay: int = 300):
    import time
    time.sleep(delay)
    try:
        os.remove(path)
    except:
        pass


def get_ydl_opts(quality: str, output_path: str):
    base_opts = {
        "outtmpl": output_path,
        "quiet": False,
        "no_warnings": False,
        "merge_output_format": "mp4",
    }

    quality_map = {
        "4k":    "bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=2160]+bestaudio/best",
        "1080p": "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1080]+bestaudio/best",
        "720p":  "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best",
        "480p":  "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=480]+bestaudio/best",
        "360p":  "bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=360]+bestaudio/best",
        "best":  "bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best",
        "audio": "bestaudio/best",
    }

    fmt = quality_map.get(quality, quality_map["best"])

    if quality == "audio":
        base_opts["format"] = fmt
        base_opts["postprocessors"] = [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192",
        }]
        base_opts["outtmpl"] = output_path.replace(".mp4", ".mp3")
    else:
        base_opts["format"] = fmt

    return base_opts


# ─── Celery Task ────────────────────────────────────────────────
@celery_app.task(bind=True)
def download_task(self, url: str, quality: str, file_id: str):
    output_template = str(DOWNLOAD_DIR / f"{file_id}.%(ext)s")

    def progress_hook(d):
        if d["status"] == "downloading":
            raw = d.get("_percent_str", "0%").strip().replace("%", "")
            try:
                pct = float(raw)
            except:
                pct = 0
            self.update_state(state="PROGRESS", meta={"status": "downloading", "percent": round(pct)})
        elif d["status"] == "finished":
            self.update_state(state="PROGRESS", meta={"status": "processing", "percent": 99})

    opts = get_ydl_opts(quality, output_template)
    opts["progress_hooks"] = [progress_hook]

    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
        title = info.get("title", "video")

    downloaded = list(DOWNLOAD_DIR.glob(f"{file_id}.*"))
    if not downloaded:
        raise Exception("Download failed — file not found")

    filepath = downloaded[0]
    actual_ext = filepath.suffix.lstrip(".")

    if actual_ext not in ["mp4", "mp3", "webm", "mkv", "m4a"]:
        raise Exception(f"Unexpected file type: {actual_ext}")

    safe_title = "".join(c for c in title if c.isalnum() or c in " -_")[:60].strip()
    if not safe_title:
        safe_title = "video"
    filename = f"{safe_title}.{actual_ext}"

    return {
        "status": "done",
        "filepath": str(filepath),
        "filename": filename,
        "actual_ext": actual_ext,
        "file_id": file_id,
    }


# ─── Routes ─────────────────────────────────────────────────────
@app.get("/api/info")
async def get_video_info(url: str):
    try:
        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

        formats = []
        seen = set()
        if info.get("formats"):
            for f in info["formats"]:
                h = f.get("height")
                ext = f.get("ext")
                if h and ext in ["mp4", "webm"] and h not in seen:
                    seen.add(h)
                    label = f"{h}p"
                    if h >= 2160:
                        label = "4K"
                    formats.append({"label": label, "value": f"{h}p" if h < 2160 else "4k"})

        formats = sorted(formats, key=lambda x: int(x["value"].replace("p", "").replace("k", "0000")), reverse=True)
        formats.append({"label": "MP3 Audio", "value": "audio"})

        return {
            "title": info.get("title", "Unknown"),
            "thumbnail": info.get("thumbnail", ""),
            "duration": info.get("duration", 0),
            "uploader": info.get("uploader", ""),
            "platform": info.get("extractor_key", ""),
            "formats": formats if formats else [
                {"label": "Best Quality", "value": "best"},
                {"label": "1080p", "value": "1080p"},
                {"label": "720p", "value": "720p"},
                {"label": "MP3 Audio", "value": "audio"},
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not fetch video info: {str(e)}")


@app.post("/api/download")
async def start_download(req: VideoRequest):
    file_id = str(uuid.uuid4())
    task = download_task.delay(req.url, req.quality, file_id)
    return {"job_id": task.id, "file_id": file_id}


@app.get("/api/progress/{job_id}")
async def progress_stream(job_id: str):
    def event_stream():
        import time
        while True:
            task = celery_app.AsyncResult(job_id)

            if task.state == "PROGRESS":
                data = task.info or {}
                yield f"data: {json.dumps(data)}\n\n"

            elif task.state == "SUCCESS":
                yield f"data: {json.dumps({'status': 'done', 'percent': 100})}\n\n"
                break

            elif task.state == "FAILURE":
                yield f"data: {json.dumps({'status': 'error', 'percent': 0})}\n\n"
                break

            else:
                yield f"data: {json.dumps({'status': 'starting', 'percent': 0})}\n\n"

            time.sleep(0.5)

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.get("/api/file/{job_id}")
async def get_file(job_id: str, background_tasks: BackgroundTasks):
    task = celery_app.AsyncResult(job_id)

    if task.state != "SUCCESS":
        raise HTTPException(status_code=400, detail="File not ready yet.")

    result = task.result
    filepath = Path(result["filepath"])

    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found.")

    background_tasks.add_task(cleanup_file, str(filepath), 600)

    return FileResponse(
        path=str(filepath),
        filename=result["filename"],
        media_type="video/mp4" if result["actual_ext"] == "mp4" else "audio/mpeg",
        headers={
            "Content-Disposition": f'attachment; filename="{result["filename"]}"',
            "X-Server-Filename": f"{result['file_id']}.{result['actual_ext']}",
            "X-Job-ID": job_id,
            "Content-Length": str(filepath.stat().st_size),
        }
    )


@app.post("/api/trim")
async def trim_video(req: TrimRequest, background_tasks: BackgroundTasks):
    try:
        source = DOWNLOAD_DIR / req.filename
        if not source.exists():
            raise HTTPException(status_code=404, detail="Source file not found. Download it first.")

        trimmed_id = str(uuid.uuid4())
        ext = source.suffix
        output_path = str(DOWNLOAD_DIR / f"trimmed_{trimmed_id}{ext}")

        cmd = [
            "ffmpeg", "-y",
            "-i", str(source),
            "-ss", req.start,
            "-to", req.end,
            "-c", "copy",
            output_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"FFmpeg error: {result.stderr}")

        background_tasks.add_task(cleanup_file, output_path, 300)

        trimmed_filename = f"trimmed_{trimmed_id}{ext}"
        return FileResponse(
            path=output_path,
            filename=trimmed_filename,
            media_type="video/mp4",
            headers={
                "Content-Disposition": f'attachment; filename="{trimmed_filename}"',
                "Content-Length": str(Path(output_path).stat().st_size),
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/preview/{filename}")
async def preview_video(filename: str):
    filepath = DOWNLOAD_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path=str(filepath), media_type="video/mp4")


@app.get("/health")
async def health():
    return {"status": "ok"}