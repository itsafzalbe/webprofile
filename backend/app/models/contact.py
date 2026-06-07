from beanie import Document
from pydantic import Field, EmailStr
from datetime import datetime
from typing import Optional


class ContactMessage(Document):
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    is_read: bool = False
    is_spam: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "contact_messages"
        indexes = ["is_read", "is_spam", "created_at"]
