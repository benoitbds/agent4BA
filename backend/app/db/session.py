from sqlmodel import SQLModel, create_engine, Session

from app.core.config import get_settings

settings = get_settings()
engine = create_engine(settings.sqlite_url, connect_args={"check_same_thread": False})


def get_session():
    with Session(engine) as session:
        yield session


def init_db() -> None:
    # Import all models here before calling create_all
    # to ensure their metadata is registered.
    print('init DB !')
    import app.models.user # noqa: F401
    import app.models.project # noqa: F401
    import app.models.requirements  # noqa: F401
    # Add other model modules if they exist, e.g., app.models.activity
    SQLModel.metadata.create_all(engine)
