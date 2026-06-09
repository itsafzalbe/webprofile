from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import init_db, connect_redis, close_db
from app.api.v1.router import router
import asyncio
import logging

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger(__name__)

async def analytics_broadcaster():
    while True:
        try:
            from app.websockets.analytics_ws import broadcast_analytics_update
            await broadcast_analytics_update()
        except Exception as e:
            logger.error(f"Broadcaster error: {e}")
        await asyncio.sleep(5)

async def session_cleanup():
    while True:
        await asyncio.sleep(600)
        try:
            from app.services.analytics_service import mark_sessions_inactive
            await mark_sessions_inactive()
        except Exception as e:
            logger.error(f"Session cleanup error: {e}")



@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await init_db()
    await connect_redis()

    from app.services.auth_service import get_or_create_admin
    await get_or_create_admin()

    broadcaster = asyncio.create_task(analytics_broadcaster())
    cleanup = asyncio.create_task(session_cleanup())
    yield

    broadcaster.cancel()
    cleanup.cancel()
    await close_db()
    logger.info("Shutdown complete")



app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,

    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }
