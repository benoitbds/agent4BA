from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, users, projects, chat
from app.db.session import init_db
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    if not settings.openai_api_key:
        raise ValueError("OPENAI_API_KEY is missing")
    if settings.secret_key == "CHANGE_ME":
        raise RuntimeError("Please set SECRET_KEY in backend/.env")
    init_db()

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(chat.router)
