from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class UserResponse(BaseModel):
    username: str
    is_admin: bool
    last_login: Optional[datetime]
    created_at: datetime








