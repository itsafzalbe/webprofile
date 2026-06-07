from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class BlogPostCreate(BaseModel):
    title: str
    slug: str
    excerpt: str
    content: str
    tags: List[str] = []
    category: Optional[str] = None
    cover_image: Optional[str] = None
    is_published: bool = False


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    cover_image: Optional[str] = None
    is_published: Optional[bool] = None



class BlogPostResponse(BaseModel):
    id: str
    title: str
    slug: str
    excerpt: str
    content: Optional[str] = None
    tags: List[str]
    category: Optional[str]
    cover_image: Optional[str]
    is_published: bool
    view_count: int
    read_time: int
    created_at: datetime
    updated_at: datetime



class BlogPostListResponse(BaseModel):
    id: str
    title: str
    slug: str
    excerpt: str
    tags: List[str]
    category: Optional[str]
    cover_image: Optional[str]
    is_published: bool
    view_count: int
    read_time: int
    created_at: datetime
    updated_at: datetime