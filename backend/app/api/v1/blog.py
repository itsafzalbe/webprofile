from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.schemas.blog import BlogPostCreate, BlogPostUpdate, BlogPostResponse, BlogPostListResponse
from app.schemas.common import SuccessResponse
from app.services import blog_service
from app.api.deps import get_admin_user
from app.models.user import User
from typing import Optional, List
from app.utils.rate_limiter import limiter

router = APIRouter(prefix="/blog", tags=["blog"])



#public apis
@router.get("", response_model=dict)
@limiter.limit("60/minute")
async def list_posts(
    tag: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
    ):

    return await blog_service.get_all_posts(
        published_only=True,
        tag=tag,
        category=category,
        limit=limit,
        skip=skip,
    )

@router.get("/tags", response_model=List[str])
@limiter.limit("60/minute")
async def list_tags():
    return await blog_service.get_all_tags()


@router.get("/categories", response_model=List[str])
@limiter.limit("60/minute")
async def list_categories():
    return await blog_service.get_all_categories()


@router.get("/{slug}", response_model=BlogPostResponse)
@limiter.limit("30/minute")
async def get_post(slug: str):
    post = await blog_service.get_post_by_slug(slug, increment_view=True)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post '{slug}' not found"
        )
    return post

@router.get("/{slug}/related", response_model=List[BlogPostListResponse])
@limiter.limit("30/minute")
async def get_related(slug: str, limit: int = Query(3, ge=1, le=10)):
    return await blog_service.get_related_posts(slug, limit=limit)



#Admin apis
@router.get("/admin/all", response_model=dict)
async def admin_list_all(
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    admin: User = Depends(get_admin_user),
):
    return await blog_service.get_all_posts(
        published_only=False,
        limit=limit,
        skip=skip,
    )

@router.post("", response_model=BlogPostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    payload: BlogPostCreate,
    admin: User = Depends(get_admin_user)
):
    try:
        return await blog_service.create_post(payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.patch("/{slug}", response_model=BlogPostResponse)
async def update_post(
    slug: str,
    payload: BlogPostUpdate,
    admin: User = Depends(get_admin_user),
):
    post = await blog_service.update_post(slug, payload)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post '{slug}' not found",
        )
    return post


@router.delete("/{slug}", response_model=SuccessResponse)
async def delete_post(slug: str, admin: User = Depends(get_admin_user)):
    deleted = await blog_service.delete_post(slug)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post '{slug}' not found",
        )
    return SuccessResponse(message=f"Post '{slug}' deleted")

@router.post("/{slug}/publish", response_model=SuccessResponse)
async def publish_post(slug: str, admin: User = Depends(get_admin_user)):
    post = await blog_service.update_post(slug, BlogPostUpdate(is_published=True))
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post '{slug}' not found",
        )
    return SuccessResponse(message=f"Post '{slug}' published")


@router.post("/{slug}/unpublish", response_model=SuccessResponse)
async def unpublish_post(slug: str, admin: User = Depends(get_admin_user)):
    post = await blog_service.update_post(slug, BlogPostUpdate(is_published=False))
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post '{slug}' not found",
        )
    return SuccessResponse(message=f"Post '{slug}' unpublished")