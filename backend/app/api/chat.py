import json
import re
from fastapi import APIRouter, Depends, HTTPException, Request as FastAPIRequest
from pydantic import BaseModel # Field is not used directly here, but good to have if models evolve
from sqlmodel import Session, select
import openai
import httpx # For making internal API calls

from app.api.deps import get_db, get_current_user
from app.models.activity import Activity
from app.models.project import Project
from app.models.user import User
from app.core.config import get_settings
from app.schemas.requirements import RequirementCreate

settings = get_settings()
if settings.openai_api_key:
    openai.api_key = settings.openai_api_key
else:
    # This should ideally be caught by main.py's startup check
    print("Warning: OPENAI_API_KEY not found. OpenAI calls may fail.")

router = APIRouter(tags=["Chat"], prefix="")

# --- Pydantic models for AI structured suggestions ---
class AISuggestedRequirement(BaseModel):
    title: str
    description: str | None = None

class AIAction(BaseModel):
    action: str # e.g., "create_requirement"
    data: AISuggestedRequirement # Assuming data will always be for a requirement for now

# --- Helper to call internal CRUD API ---
async def call_internal_create_requirement(
    requirement_data: RequirementCreate,
    fastapi_request: FastAPIRequest
):
    token = fastapi_request.headers.get("authorization") # e.g., "Bearer <token>"
    base_url = str(fastapi_request.base_url).rstrip('/')
    create_req_url = f"{base_url}/api/v1/requirements/"

    async with httpx.AsyncClient() as client:
        headers = {}
        if token:
            headers["Authorization"] = token

        try:
            # Use .model_dump() for Pydantic v2, .dict() for v1
            payload = requirement_data.model_dump() if hasattr(requirement_data, "model_dump") else requirement_data.dict()
            response = await client.post(
                create_req_url,
                json=payload,
                headers=headers
            )
            response.raise_for_status() # Raises HTTPStatusError for 4xx/5xx responses
            return response.json()
        except httpx.HTTPStatusError as e:
            print(f"Internal API call failed: {e.response.status_code} - {e.response.text}")
            return {"error": "Failed to create item internally via API", "status_code": e.response.status_code, "detail": e.response.text}
        except Exception as e:
            print(f"Internal API call general error: {e}")
            return {"error": "Failed to create item internally via API", "detail": str(e)}

def log_activity(db: Session, project_id: int, type_: str, content: str):
    activity = Activity(project_id=project_id, type=type_, content=content)
    db.add(activity)
    db.commit()

def parse_ai_response_for_action(text: str) -> AIAction | None:
    try:
        # Regex to find ```json ... ``` block
        match = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL | re.IGNORECASE)
        if match:
            json_str = match.group(1)
            data = json.loads(json_str)
            if isinstance(data, dict) and data.get("action") == "create_requirement" and isinstance(data.get("data"), dict):
                # Validate data part for AISuggestedRequirement
                suggested_req_data = AISuggestedRequirement(**data["data"])
                return AIAction(action="create_requirement", data=suggested_req_data)
    except json.JSONDecodeError:
        print(f"JSONDecodeError parsing AI response: {text}")
    except Exception as e: # Catch Pydantic validation errors or other issues
        print(f"Error parsing AI action from text '{text[:100]}...': {e}")
    return None

@router.post("/chat")
async def chat(
    fastapi_request: FastAPIRequest, # For base_url and headers
    project_id: int,
    message: str, # Expecting this as a query parameter as per original endpoint
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    project = db.get(Project, project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found or not authorized")

    if not openai.api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")

    system_prompt = (
        "You are an expert Business Analyst assistant. Your goal is to help users define and structure functional items "
        "like Requirements, Epics, Features, User Stories, and Use Cases.\n"
        "When a user asks you to create a functional item, or if you infer it from the conversation, "
        "respond with the item's details formatted as a JSON object within triple backticks (```json ... ```).\n"
        "The JSON object should have an \"action\" field (e.g., \"create_requirement\") and a \"data\" field.\n"
        "For example, to create a requirement:\n"
        "```json\n"
        "{\n"
        "  \"action\": \"create_requirement\",\n"
        "  \"data\": {\n"
        "    \"title\": \"User Login\",\n"
        "    \"description\": \"As a user, I want to be able to log in to the system securely.\"\n"
        "  }\n"
        "}\n"
        "```\n"
        "Ensure the data fields match the expected structure for the item type.\n"
        "For other interactions, provide helpful textual responses."
    )


    messages_for_ai = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": message}
    ]

    ai_text_reply = ""
    created_item_info = None

    try:
        client = openai.AsyncOpenAI()
        completion = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages_for_ai
        )
        if completion.choices and completion.choices[0].message and completion.choices[0].message.content:
            ai_text_reply = completion.choices[0].message.content.strip()
        else:
            ai_text_reply = "No substantive response from AI."

    except Exception as e:
        print(f"OpenAI API call failed: {e}")
        # Consider logging the full error `e` for better diagnostics
        raise HTTPException(status_code=500, detail=f"Failed to get response from AI: {str(e)[:100]}") # Truncate long errors

    log_activity(db, project_id, "chat_message_user", message)
    log_activity(db, project_id, "chat_message_ai", ai_text_reply)

    parsed_action = parse_ai_response_for_action(ai_text_reply)

    if parsed_action and parsed_action.action == "create_requirement":
        # Ensure data is of type AISuggestedRequirement (already handled by Pydantic in AIAction)
        requirement_to_create = RequirementCreate(
            title=parsed_action.data.title,
            description=parsed_action.data.description,
            project_id=project_id, # from the current context
            is_active=True # Default value
        )
        print(f"AI suggested creating requirement: {requirement_to_create.title}")

        # Attempt to create the requirement via internal API call
        internal_creation_result = await call_internal_create_requirement(requirement_to_create, fastapi_request)

        if internal_creation_result and not internal_creation_result.get("error"):
            created_item_info = {"type": "requirement", "data": internal_creation_result}
            log_activity(db, project_id, "ai_created_requirement", json.dumps(internal_creation_result))
            # Optionally append to ai_text_reply to confirm creation in chat
            # ai_text_reply += f"\n\n(System: Successfully created requirement '{requirement_to_create.title}')"
        else:
            error_msg = json.dumps(internal_creation_result or {"detail": "Unknown internal error"})
            log_activity(db, project_id, "ai_create_requirement_failed", error_msg)
            print(f"Failed to create requirement via internal API: {error_msg}")
            # Optionally append to ai_text_reply to inform user of failure
            # detail = internal_creation_result.get('detail', 'failed to process suggestion') if internal_creation_result else 'failed'
            # ai_text_reply += f"\n\n(System: AI suggested creating '{requirement_to_create.title}', but it could not be processed: {detail})"


    return {"reply": ai_text_reply, "created_item": created_item_info}



@router.post("/projects/{project_id}/generate")
async def generate_specs(project_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    project = db.get(Project, project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found or not authorized")
    specs = ["Spec 1 (from stub, now async)", "Spec 2 (from stub, now async)"] # Stub
    log_activity(db, project_id, "spec_generate_stub", "generate")
    return {"specs": specs}


@router.post("/projects/{project_id}/validate")
async def validate_project(project_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):

    project = db.get(Project, project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found or not authorized")
    log_activity(db, project_id, "validate_project_stub", "validate") # Changed type for clarity
    return {"complete": True, "errors": []}


@router.get("/ai-activity/sessions", response_model=list[Activity])
async def get_ai_activity(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Consider filtering by project_id or current_user.id for non-admin users

    statement = select(Activity).order_by(Activity.timestamp.desc()).limit(10)
    activities = db.exec(statement).all()
    return activities
