from fastapi import APIRouter, Query
from app.services import search_service
from app.schemas.common import SearchResponse
from typing import Optional
from app.utils.rate_limiter import limiter

router = APIRouter(prefix="/search", tags=["search"])

@router.get("", response_model=SearchResponse)
@limiter.limit("30/minute")
async def search(
    q: str = Query(min_length=1, max_length=100),
    type: Optional[str] = Query(
        "all",
        pattern="^(all|projects|blog|skills|files)$"
    ),
):
    return await search_service.search(query=q, search_type=type)



@router.get("/suggestions")
@limiter.limit("60/minute")
async def suggestions(
    q: str = Query(min_length=1, max_length=50),
    limit: int = Query(5, ge=1, le=10),
):
    results = await search_service.get_suggestions(q, limit=limit)
    return {"query": q, "suggestions": results}
