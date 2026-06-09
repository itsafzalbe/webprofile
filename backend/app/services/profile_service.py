from datetime import datetime
from typing import Optional
from app.models.profile import Profile
from app.schemas.profile import ProfileCreate, ProfileUpdate
import logging

logger = logging.getLogger(__name__)

async def get_profile() -> Optional[dict]:
    profile = await Profile.find_one()
    if not profile:
        return None
    return _format(profile)

def _format(profile: Profile) -> dict:
    return {
        "full_name": profile.full_name,
        "username": profile.username,
        "title": profile.title,
        "bio": profile.bio,
        "short_bio": profile.short_bio,
        "age": profile.age,
        "location": profile.location,
        "country": profile.country,
        "email": profile.email,
        "avatar_url": profile.avatar_url,
        "available_for_work": profile.available_for_work,
        "social_links": profile.social_links,
        "skills_summary": profile.skills_summary,
        "languages": profile.languages,
        "updated_at": profile.updated_at,
    }

async def create_profile(data: ProfileCreate) -> dict:
    existing = await Profile.find_one()
    if existing:
        raise ValueError("Profile already exists. use update instead.")
    profile = Profile(**data.model_dump())
    await profile.insert()
    logger.info("Profile created")
    return _format(profile)

async def update_profile(data: ProfileUpdate) -> Optional[dict]:
    profile = await Profile.find_one()
    if not profile:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    profile.updated_at = datetime.utcnow()
    await profile.save()
    logger.info("Profile updated")
    return _format(profile)




async def get_whoami() -> str:
    profile = await Profile.find_one()
    if not profile:
        return "afzalbek - profile not configured"
    status = "✔︎ Available for work" if profile.available_for_work else "✗ Not available"
    return (
        f"{profile.full_name} (@{profile.username})\n"
        f"{profile.title}\n"
        f"{profile.location}, {profile.country}\n"
        f"{status}\n"
        f"{profile.short_bio}"
    )