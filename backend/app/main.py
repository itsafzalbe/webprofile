import asyncio
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.config import settings
from app.database import init_db, connect_redis, close_db
from app.api.v1.router import router
from app.core.middleware import (
    RequestLoggingMiddleware,
    SessionMiddleware,
    SecurityHeadersMiddleware,
)
from app.core.exceptions import register_exception_handlers
from app.utils.rate_limiter import limiter, rate_limit_exceeded_handler
from app.websockets.manager import manager
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

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

    tasks =[
        asyncio.create_task(analytics_broadcaster),
        asyncio.create_task(session_cleanup),
    ]

    logger.info("All systems online")
    yield
    for task in tasks:
        tasks.cancel()


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

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SessionMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.mount("/static", StaticFiles(directory="static"), name="static")


app.include_router(router)


@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }
