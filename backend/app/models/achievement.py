from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional

class Achievement(Document):
    title: str
    issuer: str
    description: Optional[str] = None
    category: str 
    credential_url: Optional[str] = None
    image_url: Optional[str] = None
    issued_date: Optional[datetime] = None
    skills: list[str] = Field(default_factory=list)
    is_featured: bool = False
    is_hidden: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "achievements"
        indexes = ["category", "is_hidden", "is_featured", "issued_date"]