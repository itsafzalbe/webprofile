from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List



class ProjectCreate(BaseModel):
    title: str
    slug: str
    description: str
    long_description: Optional[str] = None
    tech_stack: List[str] = []
    tags: List[str] = []
    screenshots: List[str] = []
    architecture_overview: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    challenges: Optional[str] = None
    is_featured: bool = False
    is_published: bool = True
    order: int = 0

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    long_description: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    screenshots: Optional[List[str]] = None
    architecture_overview: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    challenges: Optional[str] = None
    is_featured: Optional[bool] = None
    is_published: Optional[bool] = None
    order: Optional[int] = None


class ProjectResponse(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    long_description: Optional[str]
    tech_stack: List[str]
    tags: List[str]
    screenshots: List[str]
    architecture_overview: Optional[str]
    github_url: Optional[str]
    live_url: Optional[str]
    challenges: Optional[str]
    is_featured: bool
    is_published: bool
    order: int
    view_count: int
    created_at: datetime
    updated_at: datetime
