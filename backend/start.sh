#!/bin/bash
echo "Installing dependencies..."
pip install -r requirements.txt

echo "Checking ffmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    echo "ffmpeg not found. Install it with: sudo apt install ffmpeg"
    exit 1
fi

echo "Starting SnapLoad backend on port 8000..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
