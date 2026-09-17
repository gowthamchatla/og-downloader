# SnapLoad ⚡
> Download videos from YouTube, Instagram, Twitter/X, and Pinterest.
> 4K support · MP3 extraction · Basic video trim

---

## Stack
- **Backend**: FastAPI + yt-dlp + FFmpeg
- **Frontend**: React + Vite (glass UI, no CSS frameworks)
- **Recommended hosting**: Any VPS (Ubuntu 22.04+)

---

## Setup (VPS / Local)

### 1. System dependencies
```bash
sudo apt update
sudo apt install ffmpeg python3-pip nodejs npm -y
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
chmod +x start.sh
./start.sh
# Runs on http://localhost:8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
# Proxy to /api → localhost:8000 is pre-configured
```
# SnapLoad ⚡
> Download videos from YouTube, Instagram, Twitter/X, and Pinterest.


<img width="1717" height="921" alt="Screenshot 2026-09-17 185223" src="https://github.com/user-attachments/assets/159ead83-383a-42a8-a3e4-bf1780bdde71" />


---
---

## Production Deploy (VPS)

### Backend with systemd
```ini
# /etc/systemd/system/snapload.service
[Unit]
Description=SnapLoad Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/snapload/backend
ExecStart=uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable snapload
sudo systemctl start snapload
```

### Frontend build
```bash
cd frontend
npm run build
# Serve /dist with nginx
```

### Nginx config (both on same domain)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Serve frontend
    root /home/ubuntu/snapload/frontend/dist;
    index index.html;

    # Proxy API
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        client_max_body_size 500M;
        proxy_read_timeout 120s;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/info?url=...` | Fetch video metadata + available formats |
| POST | `/api/download` | Download video (body: `{url, quality}`) |
| POST | `/api/trim` | Trim downloaded video (body: `{filename, start, end}`) |
| GET | `/health` | Health check |

### Quality values
- `4k`, `1080p`, `720p`, `480p`, `360p` — video
- `best` — best available quality
- `audio` — extract MP3

---

## Notes
- Downloaded files auto-delete after 5 minutes
- 4K only available on YouTube when the source has it
- Trim works on the last downloaded file (server-side temp file)
- For production, set `CORS allow_origins` to your actual domain in `main.py`
