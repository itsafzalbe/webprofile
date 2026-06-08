from datetime import datetime, timedelta
from typing import Optional, List
from app.models.contact import ContactMessage
from app.schemas.contact import ContactCreate
from app.database import get_redis
import logging

logger = logging.getLogger(__name__)

SPAM_KEYWORDS = [
    "casino", "crypto", "bitcoin", "investment", "loan",
    "viagra", "click here", "earn money", "winner", 
]
MAX_MESSAGES_PER_IP = 3
RATE_WINDOW_HOURS = 24


def _format(msg: ContactMessage) -> dict:
    return {
        "id": str(msg.id),
        "name": msg.name,
        "email": msg.email,
        "subject": msg.subject,
        "message": msg.message,
        "is_read": msg.is_read,
        "is_spam": msg.is_spam,
        "ip_address": msg.ip_address,
        "created_at": msg.created_at,
    }


def _is_spam(data: ContactCreate) -> bool:
    text = f"{data.name} {data.subject or ''} {data.message}".lower()
    return any(keyword in text for keyword in SPAM_KEYWORDS)


async def _check_rate_limit(ip: str) -> bool:
    """Returns true if allowed, False if rate limited."""
    redis = get_redis()
    if not redis:
        return True
    
    key = f"contact:rate:{ip}"
    try:
        count = await redis.get(key)
        if count and int(count) >- MAX_MESSAGES_PER_IP:
            return False
        pipe = redis.pipeline()
        await pipe.incr(key)
        await pipe.expire(key, int(timedelta(hours=RATE_WINDOW_HOURS).total_seconds()))
        await pipe.execute()
        return True
    except Exception as e:
        logger.error(f"Rate limit check failed: {e}")
        return True

async def create_message(data: ContactCreate, ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> dict:
    if ip_address:
        allowed = await _check_rate_limit(ip_address)
        if not allowed:
            raise PermissionError("Too many messages. Please try again later.")
    is_spam = _is_spam(data)

    msg = ContactMessage(
        name=data.name,
        email=data.email,
        subject=data.subject,
        message=data.message,
        ip_address=ip_address,
        user_agent=user_agent,
        is_spam=is_spam,
    )
    await msg.insert()

    if is_spam:
        logger.warning(f"Spam message flagger from {ip_address}")
    else:
        logger.info(f"New contact message from {data.email}")
    
    return _format(msg)

async def get_all_messages(include_spam: bool = False, unread_only: bool = False, limit: int = 50, skip: int = 0) -> dict:
    query = {}
    if not include_spam:
        query[ContactMessage.is_spam] = False
    if unread_only:
        query[ContactMessage.is_read] = False
    
    total = await ContactMessage.find(query).count()
    messages = (
        await ContactMessage.find(query)
        .sort(-ContactMessage.created_at)
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    return {
        "items": [_format(m) for m in messages],
        "total": total,
        "unread": await ContactMessage.find(
            ContactMessage.is_spam==False,
            ContactMessage.is_read==False,
        ).count(),
    }


async def get_message_by_id(message_id: str) -> Optional[dict]:
    from beanie import PydanticObjectId
    msg = await ContactMessage.get(PydanticObjectId(message_id))
    if not msg: 
        return None
    return _format(msg)

async def mark_read(message_id: str) -> Optional[dict]:
    from beanie import PydanticObjectId
    msg = await ContactMessage.get(PydanticObjectId(message_id))
    if not msg: 
        return None
    msg.is_read = True
    await msg.save()
    return _format(msg)

async def mark_spam(message_id: str) -> Optional[dict]:
    from beanie import PydanticObjectId
    msg = await ContactMessage.get(PydanticObjectId(message_id))
    if not msg: 
        return None
    msg.is_spam = True
    await msg.save()
    return _format(msg)


async def delete_message(message_id: str) -> bool:
    from beanie import PydanticObjectId
    msg = await ContactMessage.get(PydanticObjectId(message_id))
    if not msg: 
        return None
    await msg.delete()
    return True


async def get_unread_count() -> int:
    return await ContactMessage.find(
        ContactMessage.is_spam == False,
        ContactMessage.is_read == False,
    ).count()