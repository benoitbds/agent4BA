from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Agent4BA"
    secret_key: str = "CHANGE_ME"  # should be overridden in .env
    access_token_expire_minutes: int = 30
    algorithm: str = "HS256"
    sqlite_url: str = "sqlite:///./app.db"
    cors_origins: list[str] = ["*"]

    class Config:
        env_file = ".env"

@lru_cache
def get_settings() -> Settings:
    return Settings()
