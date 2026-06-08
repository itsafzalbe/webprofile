from beanie import Document
from pydantic import Field, HttpUrl
from datetime import datetime
from typing import Optional, List
from pymongo import IndexModel, TEXT

class Project(Document):
    title: str = Field(index=True)
    slug: str = Field(index=True, unique=True)
    description: str
    long_description: Optional[str] = None
    tech_stack: List[str] = []
    tags: List[str] = []
    screenshots: List[str] = [] # urls
    architecture_overview: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    challenges: Optional[str] = None
    is_featured: bool=False
    is_published: bool=True
    order: int = 0
    view_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "projects"
        indexes = [
            "slug", 
            "tags", 
            "is_featured", 
            "is_published",
            IndexModel(
                [
                    ("title", TEXT),
                    ("description", TEXT),
                    ("long_description", TEXT),
                    ("tech_stack", TEXT),
                    ("tags", TEXT),
                    ("challenges", TEXT),
                ],
                name="project_text_index",
            ),
        ]
