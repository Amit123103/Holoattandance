#!/bin/bash
# Build script for Render

# 1. Install Dependencies
pip install -r backend/requirements.txt

# 2. Build Frontend
cd frontend
npm install
npm run build
cd ..

# 3. Move Build to Backend (Render specific)
# Render doesn't support multi-stage Docker nicely in free tiers sometimes, 
# but allows "Build Commands". This script simulates that if running natively.
# For Docker usage, use the Dockerfile.

echo "Build complete."
