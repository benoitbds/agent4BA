from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Agent4BA"
    secret_key: str = "CHANGE_ME"
    openai_api_key: str | None = None
    access_token_expire_minutes: int = 30
    algorithm: str = "HS256"
    sqlite_url: str = "sqlite:///./app.db"
    allowed_origins: list[str] = []

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
