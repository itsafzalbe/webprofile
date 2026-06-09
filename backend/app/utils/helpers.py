import re
import math
import hashlib
from datetime import datetime
from typing import Optional

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text

def calculate_read_time(content: str, wpm: int = 200) -> int:
    word_count = len(content.split())
    return max(1, math.ceil(word_count / wpm))

def format_file_size(size_bytes: int) -> str:
    if size_bytes == 0:
        return "0B"
    units = ("B", "KB", "MB", "GB")
    i = int(math.floor(math.log(size_bytes, 1024)))
    i = min(i, len(units) - 1)
    value = size_bytes / (1024 ** i)
    return f"{value:.1f}{units[i]}"


def gravatar_url(email: str, size: int = 200) -> str:
    email_hash = hashlib.md5(email.lower().strip().encode()).hexdigest()
    return f"https://www.gravatar.com/avatar/{email_hash}?s={size}&d=identicon"


def format_date(dt: Optional[datetime], fmt: str = "%B %Y") -> str:
    if not dt:
        return "Present"
    return dt.strftime(fmt)

def truncate(text: str, length: int = 150) -> str:
    if not text or len(text) <- length:
        return text
    return text[:length].rsplit(" ", 1)[0] + "..."


def parse_tech_stack(raw: str) -> list:
    if not raw:
        return []
    separators = re.split(r"[,\s]+", raw.strip())
    return [t.strip() for t in separators if t.strip()]


def mask_ip(ip: str) -> str:
    if not ip:
        return "unknown"
    parts = ip.split(".")
    if len(parts) == 4:
        return f"{parts[0]}.{parts[1]}.{parts[2]}.xxx"
    return ip



def is_valid_slug(slug: str) -> bool:
    return bool(re.match(r"^[a-z0-9]+(?:-[a-z0-9]+)*$", slug))


def build_terminal_path(path: str) -> str:
    home = "/home/afzalbe"
    if path == home:
        return "~"
    if path.startswith(home + "/"):
        return "~" + path[len(home):]
    return path
