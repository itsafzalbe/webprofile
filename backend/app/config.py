from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "AFZALBEK OS"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    MONGODB_URL: str
    MONGODB_DB_NAME: str

    REDIS_URL: str = "redis://localhost:6379"
    CACHE_TTL: int = 300

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str

    GITHUB_TOKEN: str = ""
    GITHUB_USERNAME: str = "itsafzalbe"

    AI_API_KEY: str = ""
    AI_MODEL: str = ""

    RATE_LIMIT_PER_MINUTE: int = 60

    MAX_MESSAGE_LENGTH: int = 2000

    class Config: 
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()






