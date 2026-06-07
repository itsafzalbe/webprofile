import redis.asyncio as aioredis
from app.database import get_redis
import logging

logger = logging.getLogger(__name__)

BLACKLIST_PREFIX = "blacklist:jti:"

async def blacklist_token(jti: str, ttl_seconds: int) -> bool:
    redis: aioredis.Redis = get_redis()
    if not redis:
        logger.warning("Redis unavilable - token blacklisting skipped")
        return False
    try:
        await redis.setex(f"{BLACKLIST_PREFIX}{jti}", ttl_seconds, "1")
        return True
    except Exception as e:
        logger.error(f"Failed to blacklist token: {e}")
        return False

async def is_token_blacklisted(jti: str) -> bool:
    redis: aioredis.Redis = get_redis()
    if not redis:
        return False
    try:
        result = await redis.get(f"{BLACKLIST_PREFIX}{jti}")
        return result is not None
    except Exception as e:
        logger.error(f"Failed to check blacklist: {e}")
        return False

