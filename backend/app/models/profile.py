from beanie import Document
from pydantic import Field, BaseModel
from datetime import datetime
from typing import Optional, List

class SocialLink(BaseModel):
    platform: str
    url: str
    username: Optional[str] = None

class Profile(Document):
    full_name: str
    username: str = "itsafzalbe"
    title: str # "Backend engineeer"
    bio: str
    short_bio: str # one-liner for terminal whoami
    age: Optional[int] = None
    location: str
    country: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    resume_url: Optional[str] = None # path to resume file
    available_for_work: bool = True
    social_links: List[dict] = [] # [{platform, url, username}]
    skills_summary: List[str] = [] # quick list for terminal
    languages: List[str] = [] # spoken languages
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "profile"

