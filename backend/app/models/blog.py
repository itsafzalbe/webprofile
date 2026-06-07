from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional, List

class BlogPost(Document):
    title: str = Field(index=True)
    slug: str = Field(unique=True, index=True)
    excerpt: str
    content: str
    tags: List[str] = []
    category: Optional[str] = None
    cover_image: Optional[str] = None
    is_published: bool = False
    view_count: int = 0
    read_time: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow) 
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "blog_posts"
        indexes = ["slug", "tags", "category", "is_published"]