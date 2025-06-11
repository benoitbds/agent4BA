from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.deps import get_db, get_current_user
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/", response_model=ProjectRead)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if project_in.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Owner mismatch")
    project = Project(**project_in.dict())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/", response_model=list[ProjectRead])
def read_projects(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    projects = db.exec(select(Project).where(Project.owner_id == current_user.id)).all()
    return projects


@router.get("/{project_id}", response_model=ProjectRead)
def read_project(project_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    project = db.get(Project, project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=ProjectRead)
def update_project(project_id: int, project_in: ProjectUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    project = db.get(Project, project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    project_data = project_in.dict(exclude_unset=True)
    for key, value in project_data.items():
        setattr(project, key, value)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    project = db.get(Project, project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"ok": True}
