from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, users, projects, chat, requirements_api
from app.api import requirements as project_requirements
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
    print('startup function')
    if not settings.openai_api_key:
        raise ValueError("OPENAI_API_KEY is missing")
    else : print('OPENAI_API_KEY set !')
    if settings.secret_key == "CHANGE_ME":
        raise RuntimeError("Please set SECRET_KEY in backend/.env")
    else : print('SECRET set')
    init_db()

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(chat.router)
app.include_router(requirements_api.router, prefix="/api/v1")
app.include_router(project_requirements.router, prefix="/api/v1")
