import uuid
import logging
from datetime import datetime, timedelta
from typing import Optional
from app.models.analytics import VisitorSession, CommandLog
from app.database import get_redis
import json

logger = logging.getLogger(__name__)

SESSION_TTL = 1800

def _parse_user_agent(user_agent: str) -> dict:
    ua = user_agent.lower() if user_agent else ""

    if "mobile" in ua or "android" in ua or "iphone" in ua:
        device = "mobile"
    elif "tablet" in ua or "ipad" in ua:
        device = "tablet"
    else:
        device = "desktop"
    
    if "chrome" in ua and "edg" not in ua:
        browser = "Chrome"
    elif "firefox" in ua:
        browser = "Firefox"
    elif "safari" in ua and "chrome" not in ua:
        browser = "Safari"
    elif "edg" in ua:
        browser = "Edge"
    else: 
        browser = "Other"

    if "windows" in ua:
        os = "Windows"
    elif "mac" in ua:
        os = "macOS"
    elif "linux" in ua:
        os = "Linux"
    elif "android" in ua:
        os = "Android"
    elif "iphone" in ua or "ipad" in ua:
        os = "iOS"
    else:
        os = "Other"

    return {"device": device, "browser": browser, "os": os}    



async def create_or_update_session(
    session_id: Optional[str],
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    refferer: Optional[str] = None
) -> str:
    if not session_id:
        session_id = str(uuid.uuid4())

    ua_info = _parse_user_agent(user_agent or "")
    
    session = await VisitorSession.find_one(
        VisitorSession.session_id == session_id
    )

    if session:
        session.last_seen = datetime.utcnow()
        session.page_views += 1
        session.is_active = True
        duration = (session.last_seen - session.created_at).seconds
        session.duration_seconds = duration
        await session.save()
    else:
        session = VisitorSession(
            session_id=session_id,
            ip_address=ip_address,
            device=ua_info["device"],
            browser=ua_info["browser"],
            os=ua_info["os"],
            refferer=refferer,
        )
        await session.insert()
    
    redis = get_redis()
    if redis:
        try:
            await redis.setex(
                f"session:active:{session_id}",
                SESSION_TTL,
                json.dumps({
                    "session_id": session_id,
                    "device": ua_info["device"],
                    "created_at": datetime.utcnow().isoformat(),
                })
            )
        except Exception as e:
            logger.error(f"Redis session error: {e}")
    return session_id
            

async def log_command(session_id: str, command: str, args: Optional[str] = None):
    try:
        log = CommandLog(
            session_id=session_id,
            command=command,
            args=args,
        )
        await log.insert()

        from app.websockets.analytics_ws import broadcast_analytics_update
        await broadcast_analytics_update()
    except Exception as e:
        logger.error(f"Command log error: {e}")



async def get_active_visitor_count() -> int:
    redis = get_redis()
    if redis:
        try:
            keys = await redis.keys("session:active:*")
            return len(keys)
        except Exception:
            pass
    cutoff = datetime.utcnow() - timedelta(minutes=30)
    return await VisitorSession.find(
        VisitorSession.last_seen >= cutoff
    ).count()


async def get_realtime_stats() -> dict:
    active = await get_active_visitor_count()

    total_visitors = await VisitorSession.count()

    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_visitors = await VisitorSession.find(
        VisitorSession.created_at >= today
    ).count()

    pipeline = [
        {"$group": {"_id": "$command", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    collection = CommandLog.get_motor_collection()
    cursor = collection.aggregate(pipeline)
    top_commands = [
        {"command": doc["_id"], "count": doc["count"]}
        async for doc in cursor
    ]

    device_pipeline = [
        {"$group": {"_id": "$device", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    vs_collection = VisitorSession.get_motor_collection()
    device_cursor = vs_collection.aggregate(device_pipeline)
    devices = [
        {"device": doc["_id"] or "unknown", "count": doc["count"]}
        async for doc in device_cursor
    ]

    browser_pipeline = [
        {"$group": {"_id": "$browser", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    browser_cursor = vs_collection.aggregate(browser_pipeline)
    browsers = [
        {"browser": doc["_id"] or "unknown", "count": doc["count"]}
        async for doc in browser_cursor
    ]

    # Visitors per day last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    daily_pipeline = [
        {"$match": {"created_at": {"$gte": seven_days_ago}}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$created_at",
                    }
                },
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
    ]
    daily_cursor = vs_collection.aggregate(daily_pipeline)
    daily_visitors = [
        {"date": doc["_id"], "count": doc["count"]}
        async for doc in daily_cursor
    ]

    return {
        "active_now": active,
        "total_visitors": total_visitors,
        "today_visitors": today_visitors,
        "top_commands": top_commands,
        "devices": devices,
        "browsers": browsers,
        "daily_visitors": daily_visitors,
        "timestamp": datetime.utcnow().isoformat(),
    }


async def get_full_dashboard() -> dict:
    stats = await get_realtime_stats()

    total_commands = await CommandLog.count()

    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    commands_today = await CommandLog.find(
        CommandLog.executed_at >= today
    ).count()

    recent_sessions = (
        await VisitorSession.find()
        .sort(-VisitorSession.last_seen)
        .limit(20).to_list()
    )

    sessions_data = [
        {
            "session_id": s.session_id[:8] + "...",   # truncate for privacy
            "device": s.device,
            "browser": s.browser,
            "os": s.os,
            "page_views": s.page_views,
            "duration_seconds": s.duration_seconds,
            "referrer": s.referrer,
            "created_at": s.created_at.isoformat(),
            "last_seen": s.last_seen.isoformat(),
        }
        for s in recent_sessions
    ]

    vs_collection = VisitorSession.get_motor_collection()
    os_pipeline = [
        {"$group": {"_id": "$os", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    os_cursor = vs_collection.aggregate(os_pipeline)
    os_breakdown = [
        {"os": doc["_id"] or "unknown", "count": doc["count"]}
        async for doc in os_cursor
    ]

    return {
        **stats,
        "total_commands": total_commands,
        "commands_today": commands_today,
        "recent_sessions": sessions_data,
        "os_breakdown": os_breakdown,
    }



async def mark_sessions_inactive():
    cutoff = datetime.utcnow() - timedelta(minutes=30)
    stale = await VisitorSession.find(
        VisitorSession.is_active == True,
        VisitorSession.last_seen < cutoff,
    ).to_list()

    for session in stale:
        session.is_active = False
        await session.save()
    
    if stale:
        logger.info(f"Marked {len(stale)} session inactive")