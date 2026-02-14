import sys
import os
import pytest
from unittest.mock import MagicMock, patch
import json
import asyncio

# Adjust path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.cache_service import CacheService

class TestCacheService:
    def test_connection_failure_fallback(self):
        """Test that service disables itself if Redis is down"""
        with patch('redis.from_url', side_effect=Exception("Connection refused")):
            service = CacheService()
            assert service.enabled is False
            assert service.get("key") is None
            # Should not raise error
            service.set("key", "value")

    def test_cache_decorator(self):
        """Test that decorator caches results"""
        # Mock successful redis
        mock_redis = MagicMock()
        mock_redis.get.return_value = None
        
        with patch('redis.from_url', return_value=mock_redis):
            service = CacheService()
            assert service.enabled is True
            
            # Create a mock async function to decorate
            @service.cache_response(ttl=60)
            async def expensive_op(arg):
                return {"result": arg}
            
            # Run function
            result = asyncio.run(expensive_op("test"))
            assert result == {"result": "test"}
            
            # Verify Redis set was called with JSON string
            mock_redis.setex.assert_called_once()
            args = mock_redis.setex.call_args[0]
            assert "expensive_op:arg:test" in args[0] # Key Check
            assert args[1] == 60 # TTL Check
            assert args[2] == '{"result": "test"}' # Value Check

    def test_cache_hit(self):
        """Test that decorator returns cached value"""
        mock_redis = MagicMock()
        # Return a JSON string
        mock_redis.get.return_value = '{"cached": true}'
        
        with patch('redis.from_url', return_value=mock_redis):
            service = CacheService()
            
            @service.cache_response(ttl=60)
            async def expensive_op():
                return {"cached": False}
                
            result = asyncio.run(expensive_op())
            assert result == {"cached": True}
            # Function should NOT have been called (hard to test without a spy, but result proves it)
