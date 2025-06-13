from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.deps import get_db, get_current_user
from app.models.activity import Activity
from app.models.project import Project
from app.models.user import User # Added User import
from app.services.ai_spec_service import AISpecService
from pydantic import BaseModel, Field
from typing import List

router = APIRouter(tags=["Chat"], prefix="")


def log_activity(db: Session, project_id: int, type_: str, content: str):
    activity = Activity(project_id=project_id, type=type_, content=content)
    db.add(activity)
    db.commit()


@router.post("/chat")
def chat(project_id: int, message: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.get(Project, project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    reply = "This is a stub response"
    log_activity(db, project_id, "chat", message)
    return {"reply": reply}


class GenerateSpecsRequest(BaseModel):
    project_name: str = Field(..., examples=["My Awesome Project"])
    project_description: str = Field(..., examples=["A project to make the world better."])
    project_goals: List[str] = Field(..., examples=[["Goal 1", "Goal 2"]])

@router.post("/projects/{project_id}/generate") # Ensure this path is correct and matches frontend
async def generate_specs( # Make the function async
    project_id: int,
    request_data: GenerateSpecsRequest, # New request body parameter
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # Add type hint User
):
    project = db.get(Project, project_id)
    if not project or project.owner_id != current_user.id: # Assuming User model has id
        raise HTTPException(status_code=404, detail="Project not found or not authorized")

    ai_service = AISpecService() # Initialize the service

    try:
        # Call the async method from the service
        specifications = await ai_service.generate_specifications(
            project_name=request_data.project_name,
            project_description=request_data.project_description,
            project_goals=request_data.project_goals
        )

        log_activity(db, project_id, "spec_generation_success", f"Successfully generated specs for {request_data.project_name}") # Updated log
        return specifications # Return the dict directly, FastAPI will handle JSON response

    except HTTPException as e:
        # Re-raise HTTPExceptions from AISpecService or project check
        log_activity(db, project_id, "spec_generation_failed", f"Failed to generate specs: {e.detail}")
        raise e
    except Exception as e:
        # Catch any other unexpected errors
        # Log this unexpected error
        print(f"Unexpected error in generate_specs endpoint: {type(e).__name__} - {str(e)}") # Replace with proper logging
        log_activity(db, project_id, "spec_generation_error", f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while generating specifications: {str(e)}")


@router.post("/projects/{project_id}/validate")
def validate_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.get(Project, project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    log_activity(db, project_id, "validate", "validate")
    return {"complete": True, "errors": []}


@router.get("/ai-activity/sessions", response_model=list[Activity])
def get_ai_activity(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    statement = select(Activity).order_by(Activity.timestamp.desc()).limit(10)
    activities = db.exec(statement).all()
    return activities
