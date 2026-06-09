from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List

class Settings(BaseSettings):
    APP_NAME: str
    APP_VERSION: str
    DEBUG: bool
    ENVIRONMENT: str

    HOST: str
    PORT: int
    ALLOWED_ORIGINS: List[str]

    MONGODB_URL: str
    MONGODB_DB_NAME: str

    REDIS_URL: str
    CACHE_TTL: int

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int 
    REFRESH_TOKEN_EXPIRE_DAYS: int

    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str

    GITHUB_TOKEN: str
    GITHUB_USERNAME: str

    RATE_LIMIT_PER_MINUTE: int

    MAX_MESSAGE_LENGTH: int

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()






