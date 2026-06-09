from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class SocialLinkSchema(BaseModel):
    platform: str
    url: str
    username: Optional[str] = None

class ProfileCreate(BaseModel):
    full_name: str
    username: str = "itsafzalbe"
    title: str
    bio: str
    short_bio: str
    age: Optional[int] = None
    location: str
    country: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    available_for_work: bool = True
    social_links: List[SocialLinkSchema] = []
    skills_summary: List[str] = []
    languages: List[str] = []

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    short_bio: Optional[str] = None
    age: Optional[int] = None
    location: Optional[str] = None
    country: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    available_for_work: Optional[bool] = None
    social_links: Optional[List[SocialLinkSchema]] = None
    skills_summary: Optional[List[str]] = None
    languages: Optional[List[str]] = None



class ProfileResponse(BaseModel):
    full_name: str
    username: str
    title: str
    bio: str
    short_bio: str
    age: Optional[int]
    location: str
    country: str
    email: Optional[str]
    avatar_url: Optional[str]
    available_for_work: bool
    social_links: List[SocialLinkSchema]
    skills_summary: List[str]
    languages: List[str]
    updated_at: datetime