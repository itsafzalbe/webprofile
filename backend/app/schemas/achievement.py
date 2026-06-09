from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum

class AchievementCategory(str, Enum):
    certification = "certification"
    award = "award"
    competition = "competition"
    leadership = "leadership"
    internship = "internship"
    education = "education"
    project = "project"



class AchievementCreate(BaseModel):
    title: str
    issuer: str

    category: AchievementCategory
    description: Optional[str] = None

    credential_url: Optional[str] = None
    image_url: Optional[str] = None

    skills: list[str] = Field(default_factory=list)
    issue_date: Optional[datetime] = None
    is_featured: bool = False
    is_hidden: bool = False


class AchievementUpdate(BaseModel):
    title: Optional[str] = None
    issuer: Optional[str] = None

    category: Optional[AchievementCategory] = None
    description: Optional[str] = None

    credential_url: Optional[str] = None
    image_url: Optional[str] = None

    skills: Optional[list[str]] = None
    issue_date: Optional[datetime] = None
    is_featured: Optional[bool] = None
    is_hidden: Optional[bool] = None



class AchievementResponse(BaseModel):
    id: str

    title: str
    issuer: str
    
    category: AchievementCategory

    description: Optional[str]

    credential_url: Optional[str]
    image_url: Optional[str]

    skills: list[str]
    issue_date: Optional[str]

    is_featured: bool
    created_at: datetime

    







