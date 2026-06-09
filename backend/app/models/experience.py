from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional, List

class Experience(Document):
    type: str                       # "work" | "education" | "volunteer"
    title: str                      # "Backend Engineer Intern"
    organization: str               # "Company / University name"
    location: Optional[str] = None
    description: str
    highlights: List[str] = []      #bullet points
    tech_stack: List[str] = []
    start_date: str                 # "2026-09"
    end_date: Optional[str] = None  # None = present
    is_current: bool = False
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "experience"
        indexes = ["type", "is_current", "order"]
    