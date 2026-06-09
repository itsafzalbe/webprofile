import redis.asyncio as aioredis
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import logging

logger = logging.getLogger(__name__)



mongo_client: AsyncIOMotorClient = None
redis_client: aioredis.Redis = None


async def connect_mongodb():
    global mongo_client
    try: 
        mongo_client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000,
            maxPoolSize=10,
            minPoolSize=1
        )
        await mongo_client.admin.command("ping")
        logger.info("MongoDB connected successfully")
        return mongo_client
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")
        raise

async def connect_redis():
    global redis_client
    try:
        redis_client = await aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
        )
        await redis_client.ping()
        logger.info("Redis connected successfully")
        return redis_client
    except Exception as e:
        logger.warning(f"Redis connection failed (cache disabled): {e}")
        return None

async def init_db():
    from app.models.user import User
    from app.models.project import Project
    from app.models.blog import BlogPost
    from app.models.contact import ContactMessage
    from app.models.analytics import VisitorSession, CommandLog
    from app.models.filesystem import FileSystemNode
    from app.models.profile import Profile
    from app.models.achievement import Achievement
    from app.models.experience import Experience

    client = await connect_mongodb()
    await init_beanie(
        database=client[settings.MONGODB_DB_NAME],
        document_models=[
            User,
            Project,
            BlogPost,
            ContactMessage,
            VisitorSession,
            CommandLog,
            FileSystemNode,
            Profile,
            Achievement,
            Experience,
        ],
    )
    logger.info("Beanie ODM initialized")

async def close_db():
    global mongo_client, redis_client
    if mongo_client:
        mongo_client.close()
        logger.info("MongoDB disconnected")
    if redis_client:
        await redis_client.close()
        logger.info("Redis disconnected")

def get_redis() -> aioredis.Redis:
    return redis_client