from fastapi import APIRouter, HTTPException, status, Depends, Request
from typing import List
from app.schemas.achievement import AchievementCreate, AchievementResponse, AchievementUpdate
from app.services import achievement_service
from app.api.deps import get_admin_user
from app.models.user import User
from app.utils.rate_limiter import limiter

router = APIRouter(prefix="/achievements", tags=["achievements"])

@router.get("", response_model=List[AchievementResponse])
@limiter.limit("60/minute")
async def list_achievements(request: Request):
    return await achievement_service.get_all_achievements(include_hidden=False)


@router.get("/{achievement_id}", response_model=AchievementResponse)
@limiter.limit("30/minute")
async def get_achievement(request: Request, achievement_id: str):
    achievement = await achievement_service.get_achievement_by_id(achievement_id)
    if not achievement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Achievement not found"
        )
    return achievement


# admin
@router.get("/admin/all", response_model=List[AchievementResponse])
async def admin_list_all(admin: User = Depends(get_admin_user)):
    return await achievement_service.get_all_achievements(include_hidden=True)

@router.post("", response_model=AchievementResponse, status_code=status.HTTP_201_CREATED)
async def create_achievement(payload: AchievementCreate, admin: User = Depends(get_admin_user)):
    return await achievement_service.create_achievement(payload)

@router.patch("/{achievement_id}", response_model=AchievementResponse)
async def update_achievement(achievement_id: str, payload: AchievementUpdate, admin: User = Depends(get_admin_user)):
    achievement = await achievement_service.update_achievement(achievement_id, payload)
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")
    return achievement


@router.delete("/{achievement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_achievement(achievement_id: str, admin: User = Depends(get_admin_user)):
    deleted = await achievement_service.delete_achievement(achievement_id)

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")
