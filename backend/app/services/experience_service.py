from datetime import datetime
from typing import Optional, List
from app.models.experience import Experience
from app.schemas.experience import ExperienceCreate, ExperienceUpdate
import logging

logger = logging.getLogger(__name__)

def _format(e: Experience) -> dict:
    return {
        "id": str(e.id),
        "type": e.type,
        "title": e.title,
        "organization": e.organization,
        "location": e.location,
        "description": e.description,
        "highlights": e.highlights,
        "tech_stack": e.tech_stack,
        "start_date": e.start_date,
        "end_date": e.end_date,
        "is_current": e.is_current,
        "order": e.order,
        "created_at": e.created_at,
    }


async def get_all(type_filter: Optional[str] = None) -> List[dict]:
    query = {}
    if type_filter:
        query[Experience.type] = type_filter
    items = await Experience.find(query).sort(Experience.order).to_list()
    return [_format(e) for e in items]

async def create_experience(data: ExperienceCreate) -> dict:
    exp = Experience(**data.model_dump())
    await exp.insert()
    logger.info(f"Experience created: {exp.title} at {exp.organization}")
    return _format(exp)

async def update_experience(exp_id: str, data: ExperienceUpdate) -> Optional[dict]:
    from beanie import PydanticObjectId
    exp = await Experience.get(PydanticObjectId(exp_id))
    if not exp:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exp, field, value)
    
    await exp.save()
    return _format(exp)

async def delete_experience(exp_id: str) -> bool:
    from beanie import PydanticObjectId
    exp = await Experience.get(PydanticObjectId(exp_id))
    if not exp:
        return None
    await exp.delete()
    return True