from pydantic import BaseModel
from typing import Optional, Any, List

class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Any] = None

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    detail: Optional[str] = None

class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    per_page: int
    total_pages: int

class SearchResult(BaseModel):
    type: str       # "project" | "blog" | "file" | "skill"
    title: str
    excerpt: str
    slug: Optional[str] = None
    path: Optional[str] = None
    tags: List[str] = []
    url: Optional[str] = None
    score: float = 0.0


class SearchResponse(BaseModel):
    query: str
    total: int
    results: List[SearchResult]
    took_ms: float