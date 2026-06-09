from fastapi import APIRouter, HTTPException, status, Depends, Query, Request
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.schemas.common import SuccessResponse, PaginatedResponse
from app.services import project_service
from app.api.deps import get_admin_user
from app.models.user import User
from typing import Optional, List
from app.utils.rate_limiter import limiter



router = APIRouter(prefix="/projects", tags=["projects"])


# public apis
@router.get("", response_model=List[ProjectResponse])
@limiter.limit("60/minute")
async def list_projects(request: Request, tag: Optional[str] = Query(None), featured: bool = Query(False)):
    return await project_service.get_all_projects(
        published_only=True,
        tag=tag,
        featured_only=featured,
    )

@router.get("/tags", response_model=List[str])
@limiter.limit("60/minute")
async def list_tags(request: Request,):
    return await project_service.get_all_tags()


@router.get("/{slug}", response_model=ProjectResponse)
@limiter.limit("30/minute")
async def get_project(request: Request, slug: str):
    project = await project_service.get_project_by_slug(slug, increment_view=True)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{slug}' not found",
        )
    return project


# admin apis
@router.get("/admin/all", response_model=List[ProjectResponse])
async def admin_list_all(admin: User = Depends(get_admin_user)):
    return await project_service.get_all_projects(published_only=False)

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(payload: ProjectCreate, admin: User = Depends(get_admin_user)):
    try:
        return await project_service.create_project(payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.patch("/{slug}", response_model=ProjectResponse)
async def update_project(slug: str, payload: ProjectUpdate, admin: User = Depends(get_admin_user)):
    project = await project_service.update_project(slug, payload)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{slug}' not found",
        )
    return project

@router.delete("/{slug}", response_model=SuccessResponse)
async def delete_project(slug: str, admin: User = Depends(get_admin_user)):
    deleted = await project_service.delete_project(slug)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{slug}' not found",
        )
    return SuccessResponse(message=f"Project '{slug}' deleted")
