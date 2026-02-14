import redis
import json
import os
import functools
import hashlib
from datetime import datetime

class CacheService:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        try:
            self.client = redis.from_url(self.redis_url, decode_responses=True)
            self.enabled = True
            print(f"Connected to Redis at {self.redis_url}")
        except Exception as e:
            print(f"Failed to connect to Redis: {e}")
            self.enabled = False

    def get(self, key: str):
        if not self.enabled: return None
        try:
            return self.client.get(key)
        except Exception as e:
            print(f"Redis get failed: {e}")
            self.enabled = False
            return None

    def set(self, key: str, value: str, ttl: int = 60):
        if not self.enabled: return
        try:
            self.client.setex(key, ttl, value)
        except Exception as e:
            print(f"Redis set failed: {e}")
            self.enabled = False

    def cache_response(self, ttl: int = 60):
        """
        Decorator to cache API responses.
        Generates a key based on function name + args + kwargs.
        """
        def decorator(func):
            @functools.wraps(func)
            async def wrapper(*args, **kwargs):
                if not self.enabled:
                    return func(*args, **kwargs)

                # Generate Cache Key
                # Filter out 'db' session and 'current_user' from args to avoid un-hashable objects
                # This is a naive implementation; usually we use the Request URL
                
                # Better approach: Use a predefined prefix or let the caller specify
                # For now, let's use a meaningful key structure
                
                # Construct key from args (skipping dependencies)
                key_parts = [func.__name__]
                for k, v in kwargs.items():
                    if k not in ['db', 'current_user', 'request']:
                        key_parts.append(f"{k}:{v}")
                
                cache_key = ":".join(key_parts)
                
                # Check Cache
                cached = self.get(cache_key)
                if cached:
                    return json.loads(cached)
                
                # Execute Function
                # Handle both async and sync
                if asyncio.iscoroutinefunction(func):
                    result = await func(*args, **kwargs)
                else:
                    result = func(*args, **kwargs)
                
                # Cache Result
                # We need to ensure result is JSON serializable
                try:
                    self.set(cache_key, json.dumps(result), ttl)
                except Exception as e:
                    print(f"Cache encoding failed: {e}")
                
                return result
            return wrapper
        return decorator

import asyncio
cache_service = CacheService()
