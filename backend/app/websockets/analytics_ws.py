import asyncio
import logging
from fastapi import WebSocket, WebSocketDisconnect
from app.websockets.manager import manager
from app.services.analytics_service import (
    get_active_visitor_count,
    get_realtime_stats,
)

logger = logging.getLogger(__name__)

ROOM = "analytics"
BROADCAST_INTERVAL = 5


async def analytics_ws_handler(websocket: WebSocket):
    await manager.connect(websocket, room=ROOM)
    try:
        stats = await get_realtime_stats()
        await manager.send_to(websocket, {"type": "init", "data": stats})

        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30)
                if data == "ping":
                    await manager.send_to(websocket, {"type": "pong"})
            except asyncio.TimeoutError:
                await manager.send_to(websocket, {"type": "ping"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, room=ROOM)
    except Exception as e:
        logger.error(f"Analytics WS error: {e}")
        manager.disconnect(websocket, room=ROOM)


async def broadcast_analytics_update():
    if manager.room_count(ROOM) == 0:
        return
    try:
        stats = await get_realtime_stats()
        await manager.broadcast(ROOM, {"type": "update", "data": stats})
    except Exception as e:
        logger.error(f"Analytics broadcast error: {e}")