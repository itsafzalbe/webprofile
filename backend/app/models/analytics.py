from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional

class VisitorSession(Document):
    session_id: str = Field(index=True)
    ip_address: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    device: Optional[str] = None        # desktop / mobile / tablet
    browser: Optional[str] = None
    os: Optional[str] = None
    referrer: Optional[str] = None
    is_active: bool = True
    duration_seconds: int = 0
    page_views: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_seen: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "visitor_sessions"
        indexes = ["session_id", "country", "is_active", "created_at"]

class CommandLog(Document):
    session_id: str = Field(index=True)
    command: str = Field(index=True)
    args: Optional[str] = None
    executed_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "command_logs"
        indexes = ["session_id", "command", "executed_at"]
