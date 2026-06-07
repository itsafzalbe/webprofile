from datetime import datetime
from typing import Optional
from app.models.user import User
from app.core.security import *
from app.config import settings
import logging

logger = logging.getLogger(__name__)

async def authenticate_user(username: str, password: str) -> Optional[User]:
    user = await User.find_one(User.username==username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


async def get_or_create_admin() -> User:
    admin = await User.find_one(User.username == settings.ADMIN_USERNAME)
    if not admin:
        admin = User(
            username=settings.ADMIN_USERNAME,
            hashed_password=hash_password(settings.ADMIN_PASSWORD),
            is_admin=True,
        )
        await admin.insert()
        logger.info("Admin user created.")
    return admin


async def refresh_access_token(refresh_token: str) -> Optional[dict]:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        return None
    
    user = await User.find_one(User.username == payload.get("sub"))
    if not user or not user.is_active:
        return None
    
    access_token = create_access_token({"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


async def update_last_login(user: User) -> None:
    user.last_login = datetime.utcnow()
    await user.save()

