from typing import Optional, List
from app.models.achievement import Achievement
from app.schemas.achievement import AchievementCreate, AchievementUpdate
import logging

logger = logging.getLogger(__name__)

async def get_all_achievements(include_hidden: bool = False) -> List[dict]:
    query = {}
    if include_hidden:
        query["is_hidden"] = False
    achievements = await Achievement.find(query).to_list()
    return [_format(a) for a in achievements]

async def get_achievement_by_id(achievement_id: str) -> Optional[dict]:
    achievement = await Achievement.get(achievement_id)
    if not achievement:
        return None
    
    return _format(achievement)

async def create_achievement(data: AchievementCreate) -> dict:
    achievement = Achievement(**data.model_dump())
    await achievement.insert()

    logger.info(
        f"Achievement created: {achievement.title}"
    )
    return _format(achievement)

async def update_achievement(achievement_id: str, data: AchievementUpdate) -> Optional[dict]:
    achievement = await Achievement.get(achievement_id)
    if not achievement:
        return None
    
    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(achievement, field, value)
    
    await achievement.save()
    logger.info(f"Achievement updated: {achievement.title}")
    return _format(achievement)

async def delete_achievement(achievement_id: str) -> bool:
    achievement = await Achievement.get(achievement_id)
    if not achievement:
        return False
    
    await achievement.delete()
    logger.info(f"Achievement deleted: {achievement.title}")

    return True


def _format(a: Achievement) -> dict:
    return {
        "id": str(a.id),
        "title": a.title,
        "issuer": a.issuer,
        "category": a.category,
        "description": a.description,
        "credential_url": a.credential_url,
        "image_url": a.image_url,
        "issued_date": a.issued_date,
        "skills": a.skills,
        "is_featured": a.is_featured,
        "created_at": a.created_at,

    }