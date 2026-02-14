import asyncio
import json
from typing import AsyncGenerator, List
from fastapi import Request

class SSEService:
    def __init__(self):
        self.clients: List[asyncio.Queue] = []

    async def subscribe(self, request: Request) -> AsyncGenerator[str, None]:
        """
        Creates a new client connection and yields events as they happen.
        """
        queue = asyncio.Queue()
        self.clients.append(queue)
        
        try:
            while True:
                # Check if client disconnected
                if await request.is_disconnected():
                    break
                
                # Wait for data
                data = await queue.get()
                yield f"data: {data}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            self.clients.remove(queue)

    async def broadcast(self, event_type: str, payload: dict):
        """
        Broadcasts an event to all connected clients.
        """
        message = json.dumps({
            "type": event_type,
            "payload": payload
        })
        
        for queue in self.clients:
            await queue.put(message)

# Global instance
sse_service = SSEService()
