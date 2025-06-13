from sqlmodel import SQLModel, create_engine, Session

from app.core.config import get_settings

settings = get_settings()
engine = create_engine(settings.sqlite_url, connect_args={"check_same_thread": False})


def get_session():
    with Session(engine) as session:
        yield session


def init_db() -> None:
    import app.models.requirements  # noqa: F401
    SQLModel.metadata.create_all(engine)
