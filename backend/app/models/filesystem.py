from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional, List
from pymongo import IndexModel, TEXT


class FileSystemNode(Document):
    name: str = Field(index=True)
    path: str = Field(unique=True, index=True)  # e.g. /home/avzalbek/about.txt
    node_type: str = Field(index=True)          # "file" | "directory"
    content: Optional[str] = None               # text content for files
    parent_path: Optional[str] = None           # parent directory path
    children: List[str] = []                    # child paths (for directories)
    is_hidden: bool = False                     # hidden files / dirs (easter eggs)
    permissions: str = "r--"                    # r-- / rw- / rwx
    owner: str = "itsafzalbe"
    size: int = 0                               # bytes
    created_at: datetime = Field(default_factory=datetime.utcnow)
    modified_at: datetime = Field(default_factory=datetime.utcnow)


    class Settings:
        name = "filesystem"
        indexes = [
            "path", 
            "parent_path", 
            "node_type", 
            "is_hidden",
            IndexModel(
                [
                    ("name", TEXT),
                    ("content", TEXT),
                    ("path", TEXT),
                ],
                name="filesystem_text_index",
            ),
        ]

