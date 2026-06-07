from beanie import Document 
from pydantic import Field
from datetime import datetime
from typing import Optional

class User(Document):
    username: str = Field(unique=True, index=True)
    hashed_password: str
    is_admin: bool = False
    is_active: bool = True
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "users"
        indexes = ["username"]





