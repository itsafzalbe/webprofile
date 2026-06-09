from fastapi import APIRouter, HTTPException, status, Query, Depends, Request
from app.services import github_service
from app.api.deps import get_admin_user
from app.models.user import User
from app.utils.rate_limiter import limiter

router = APIRouter(prefix="/github", tags=["github"])

@router.get("/profile")
@limiter.limit("10/minute")
async def get_profile(request: Request):
    profile = await github_service.get_profile()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GitHub API unavailable",
        )
    return profile

@router.get("/repos")
@limiter.limit("10/minute")
async def get_repos(
    request: Request,
    sort: str = Query("updated", pattern="^(updated|stars|created)$"),
    limit: int = Query(10, ge=1, le=30),
):
    return await github_service.get_repos(sort=sort, limit=limit)

@router.get("/pinned")
@limiter.limit("10/minute")
async def get_pinned(request: Request, ):
    return await github_service.get_pinned_repos()

@router.get("/contributions")
@limiter.limit("5/minute")
async def get_contributions(request: Request, ):
    data = await github_service.get_contribution_stats()
    if not data:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GitHub API unavailable",
        )
    return data



@router.get("/repos/{repo}/commits")
@limiter.limit("10/minute")
async def get_commits(
    request: Request, 
    repo: str,
    limit: int = Query(10, ge=1, le=30),
):
    return await github_service.get_recent_commits(repo, limit=limit)

@router.get("/repos/{repo}/languages")
@limiter.limit("10/minute")
async def get_languages(request: Request, repo: str):
    return await github_service.get_repo_languages(repo)


#admin only
@router.post("/cache/clear")
async def clear_cache(admin: User = Depends(get_admin_user)):
    from app.database import get_redis
    redis = get_redis()
    if not redis:
        return {"message": "Redis not available"}
    
    keys = await redis.keys("github:*")
    if keys:
        await redis.delete(*keys)
    
    return {"message": f"Cleared {len(keys)} cached GitHub entries"}




