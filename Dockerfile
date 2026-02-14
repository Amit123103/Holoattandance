# Multi-stage build for React + FastAPI

# 1. Build Frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 2. Build Backend
FROM python:3.9-slim
WORKDIR /app

# Install system dependencies for OpenCV and MediaPipe
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
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

# Run Command
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "main:app", "--bind", "0.0.0.0:8000"]
