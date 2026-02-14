# Multi-stage build for React + FastAPI

# 1. Build Frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 2. Build Backend
FROM python:3.9-slim
WORKDIR /app

# Install system dependencies for OpenCV and MediaPipe
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libegl1 \
    libgl1-mesa-dri \
    && rm -rf /var/lib/apt/lists/*

# Copy Backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

COPY backend/ .

# Copy Frontend Build to Backend Static Folder
COPY --from=frontend-build /app/frontend/dist ./static

# Create storage directories
RUN mkdir -p biometric_storage/eye_scans && \
    mkdir -p biometric_storage/thumb_scans

# Expose port
EXPOSE 8000

# Force CPU for MediaPipe/TensorFlow
ENV CUDA_VISIBLE_DEVICES=-1
# Suppress Info/Warning logs from TensorFlow/MediaPipe
ENV GLOG_minloglevel=2

# Run Command
CMD ["sh", "-c", "gunicorn -c gunicorn_conf.py main:app"]
