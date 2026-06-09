from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ExperienceCreate(BaseModel):
    type: str
    title: str
    organization: str
    location: Optional[str] = None
    description: str
    highlights: List[str] = []
    tech_stack: List[str] = []
    start_date: str
    end_date: Optional[str] = None
    is_current: bool = False
    order: int = 0

class ExperienceUpdate(BaseModel):
    title: Optional[str] = None
    organization: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    highlights: Optional[List[str]] = None
    tech_stack: Optional[List[str]] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: Optional[bool] = None
    order: Optional[int] = None





class ExperienceResponse(BaseModel):
    id: str
    type: str
    title: str
    organization: str
    location: Optional[str]
    description: str
    highlights: List[str]
    tech_stack: List[str]
    start_date: str
    end_date: Optional[str]
    is_current: bool
    order: int
    created_at: datetime