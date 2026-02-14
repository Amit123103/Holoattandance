import sys
import os

print(f"Python executable: {sys.executable}")
print(f"Python path: {sys.path}")

try:
    import pydantic
    print(f"Pydantic version: {pydantic.__version__}")
except Exception as e:
    print(f"Pydantic import failed: {e}")

try:
    from pydantic_settings import BaseSettings
    print("Pydantic-settings import successful")
except Exception as e:
    print(f"Pydantic-settings import failed: {e}")

try:
    import mediapipe as mp
    print(f"MediaPipe version: {mp.__version__}")
    print(f"MediaPipe dir: {dir(mp)}")
    print(f"MediaPipe solutions exists: {hasattr(mp, 'solutions')}")
    if hasattr(mp, 'solutions'):
        print(f"Face Mesh: {hasattr(mp.solutions, 'face_mesh')}")
except Exception as e:
    print(f"MediaPipe import failed: {e}")

try:
    import fastapi_mail
    print(f"FastAPI-Mail version: {getattr(fastapi_mail, '__version__', 'unknown')}")
except Exception as e:
    print(f"FastAPI-Mail import failed: {e}")

try:
    import slowapi
    print("SlowAPI import successful")
except Exception as e:
    print(f"SlowAPI import failed: {e}")

try:
    import redis
    print("Redis import successful")
except Exception as e:
    print(f"Redis import failed: {e}")
