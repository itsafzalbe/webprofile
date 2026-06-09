from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.schemas.experience import ExperienceCreate, ExperienceUpdate, ExperienceResponse
from app.schemas.common import SuccessResponse
from app.services import experience_service
from app.api.deps import get_admin_user
from app.models.user import User
from typing import List, Optional
from app.utils.rate_limiter import limiter

router = APIRouter(prefix="/experience", tags=["experience"])

@router.get("", response_model=List[ExperienceResponse])
@limiter.limit("30/minute")
async def list_experience(
    type: Optional[str] = Query(
        None,
        pattern="^(work|education|volunteer)$"
    ),
):
    return await experience_service.get_all(type_filter=type)


# Admin
@router.post("", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
async def create(
    payload: ExperienceCreate,
    admin: User = Depends(get_admin_user),
):
    return await experience_service.create_experience(payload)


@router.patch("/{exp_id}", response_model=ExperienceResponse)
async def update(
    exp_id: str,
    payload: ExperienceUpdate,
    admin: User = Depends(get_admin_user),
):
    exp = await experience_service.update_experience(exp_id, payload)
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return exp

@router.delete("/{exp_id}", response_model=SuccessResponse)
async def delete(exp_id: str, admin: User = Depends(get_admin_user)):
    deleted = await experience_service.delete_experience(exp_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return SuccessResponse(message="Deleted")
