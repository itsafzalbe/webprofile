import json
import logging
from typing import Dict, Set
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.rooms: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, room: str="general"):
        await websocket.accept()
        if room not in self.rooms:
            self.rooms[room] = set()
        self.rooms[room].add(websocket)
        logger.info(f"WebSocket connected to room '{room}' - total: {self.room_count(room)}")
    
    def disconnect(self, websocket: WebSocket, room: str = "general"):
        if room in self.rooms:
            self.rooms[room].discard(websocket)
            if not self.rooms[room]:
                del self.rooms[room]
        logger.info(f"WebSocket disconnected from room '{room}'")
    
    async def send_to(self, websocket: WebSocket, data: dict):
        try:
            await websocket.send_json(data)
        except Exception as e:
            logger.error(f"Send error: {e}")
    
    async def broadcast(self, room: str, data: dict):
        if room not in self.rooms:
            return
        dead = set()
        for ws in self.rooms[room].copy():
            try:
                await ws.send_json(data)
            except Exception:
                dead.add(ws)
        
        for ws in dead:
            self.rooms[room].discard(ws)
    
    async def broadcast_all(self, data: dict):
        for room in list(self.rooms.keys()):
            await self.broadcast(room, data)
    
    def room_count(self, room: str) -> int:
        return len(self.rooms.get(room, set()))
    
    def total_connections(self) -> int:
        return sum(len(conns) for conns in self.rooms.values())

manager = ConnectionManager()