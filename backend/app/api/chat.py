from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.deps import get_db, get_current_user
from app.models.activity import Activity
from app.models.project import Project

router = APIRouter(tags=["Chat"], prefix="")


def log_activity(db: Session, project_id: int, type_: str, content: str):
    activity = Activity(project_id=project_id, type=type_, content=content)
    db.add(activity)
    db.commit()


@router.post("/chat")
def chat(project_id: int, message: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    project = db.get(Project, project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    reply = "This is a stub response"
    log_activity(db, project_id, "chat", message)
    return {"reply": reply}


@router.post("/projects/{project_id}/generate")
def generate_specs(project_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    project = db.get(Project, project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    specs = ["Spec 1", "Spec 2"]
    log_activity(db, project_id, "spec", "generate")
    return {"specs": specs}


@router.post("/projects/{project_id}/validate")
def validate_project(project_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    project = db.get(Project, project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    log_activity(db, project_id, "validate", "validate")
    return {"complete": True, "errors": []}


@router.get("/ai-activity/sessions", response_model=list[Activity])
def get_ai_activity(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    statement = select(Activity).order_by(Activity.timestamp.desc()).limit(10)
    activities = db.exec(statement).all()
    return activities
