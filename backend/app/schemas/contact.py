from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class ContactCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    subject: Optional[str] = Field(None, max_length=200)
    message: str = Field(min_length=10, max_length=2000)


class ContactResponse(BaseModel):
    id: str
    name: str
    email: str
    subject: Optional[str]
    message: str
    is_read: bool
    is_spam: bool
    created_at: datetime

class ContactAdminUpdate(BaseModel):
    is_read: Optional[bool] = None
    is_spam: Optional[bool] = None
