from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse
from app.schemas.common import SuccessResponse
from app.services import profile_service
from app.api.deps import get_admin_user
from app.models.user import User
from app.utils.rate_limiter import limiter


router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("", response_model=ProfileResponse)
@limiter.limit("30/minute")
async def get_profile():
    profile = await profile_service.get_profile()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not configured yet",
        )
    return profile

@router.get("/whoami")
@limiter.limit("60/minute")
async def whoami():
    text = await profile_service.get_whoami()
    return {"output": text}


#admin
@router.post("", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(payload: ProfileCreate, admin: User = Depends(get_admin_user)):
    try:
        return await profile_service.create_profile(payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.patch("", response_model=ProfileResponse)
async def update_profile(payload: ProfileUpdate, admin: User = Depends(get_admin_user)):
    profile = await profile_service.update_profile(payload)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Create it first.",
        )
    return profile
