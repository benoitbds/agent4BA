from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api.deps import get_db, get_current_user
from app.models.requirements import Requirement, Epic, Feature, UserStory, UseCase
from app.models.user import User
from app.schemas.requirements import (
    RequirementCreate, RequirementRead, RequirementUpdate,
    EpicCreate, EpicRead, EpicUpdate,
    FeatureCreate, FeatureRead, FeatureUpdate,
    UserStoryCreate, UserStoryRead, UserStoryUpdate,
    UseCaseCreate, UseCaseRead, UseCaseUpdate,
)

router = APIRouter(prefix="/projects/{project_id}", tags=["Requirements"])

# -- Requirements --
@router.get("/requirements/", response_model=list[RequirementRead])
def list_requirements(*, project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.exec(select(Requirement).where(Requirement.project_id == project_id)).all()

@router.post("/requirements/", response_model=RequirementRead)
def create_requirement(*, project_id: int, requirement_in: RequirementCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = requirement_in.dict()
    data["project_id"] = project_id
    req = Requirement(**data)
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

@router.get("/requirements/{req_id}", response_model=RequirementRead)
def read_requirement(*, project_id: int, req_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    req = db.get(Requirement, req_id)
    if not req or req.project_id != project_id:
        raise HTTPException(status_code=404, detail="Requirement not found")
    return req

@router.put("/requirements/{req_id}", response_model=RequirementRead)
def update_requirement(*, project_id: int, req_id: int, requirement_in: RequirementUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    req = db.get(Requirement, req_id)
    if not req or req.project_id != project_id:
        raise HTTPException(status_code=404, detail="Requirement not found")
    data = requirement_in.dict(exclude_unset=True)
    data.pop("project_id", None)
    for key, value in data.items():
        setattr(req, key, value)
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

@router.delete("/requirements/{req_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_requirement(*, project_id: int, req_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    req = db.get(Requirement, req_id)
    if not req or req.project_id != project_id:
        raise HTTPException(status_code=404, detail="Requirement not found")
    db.delete(req)
    db.commit()
    return None

# -- Epics --
@router.get("/requirements/{req_id}/epics/", response_model=list[EpicRead])
def list_epics(*, project_id: int, req_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.exec(select(Epic).where(Epic.parent_req_id == req_id, Epic.project_id == project_id)).all()

@router.post("/requirements/{req_id}/epics/", response_model=EpicRead)
def create_epic(*, project_id: int, req_id: int, epic_in: EpicCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = epic_in.dict()
    data.update({"project_id": project_id, "parent_req_id": req_id})
    epic = Epic(**data)
    db.add(epic)
    db.commit()
    db.refresh(epic)
    return epic

@router.get("/requirements/{req_id}/epics/{epic_id}", response_model=EpicRead)
def read_epic(*, project_id: int, req_id: int, epic_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    epic = db.get(Epic, epic_id)
    if not epic or epic.project_id != project_id or epic.parent_req_id != req_id:
        raise HTTPException(status_code=404, detail="Epic not found")
    return epic

@router.put("/requirements/{req_id}/epics/{epic_id}", response_model=EpicRead)
def update_epic(*, project_id: int, req_id: int, epic_id: int, epic_in: EpicUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    epic = db.get(Epic, epic_id)
    if not epic or epic.project_id != project_id or epic.parent_req_id != req_id:
        raise HTTPException(status_code=404, detail="Epic not found")
    data = epic_in.dict(exclude_unset=True)
    data.pop("project_id", None)
    data.pop("parent_req_id", None)
    for key, value in data.items():
        setattr(epic, key, value)
    db.add(epic)
    db.commit()
    db.refresh(epic)
    return epic

@router.delete("/requirements/{req_id}/epics/{epic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_epic(*, project_id: int, req_id: int, epic_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    epic = db.get(Epic, epic_id)
    if not epic or epic.project_id != project_id or epic.parent_req_id != req_id:
        raise HTTPException(status_code=404, detail="Epic not found")
    db.delete(epic)
    db.commit()
    return None

# -- Features --
@router.get("/requirements/{req_id}/epics/{epic_id}/features/", response_model=list[FeatureRead])
def list_features(*, project_id: int, req_id: int, epic_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.exec(select(Feature).where(Feature.parent_epic_id == epic_id, Feature.project_id == project_id)).all()

@router.post("/requirements/{req_id}/epics/{epic_id}/features/", response_model=FeatureRead)
def create_feature(*, project_id: int, req_id: int, epic_id: int, feature_in: FeatureCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = feature_in.dict()
    data.update({"project_id": project_id, "parent_epic_id": epic_id})
    feature = Feature(**data)
    db.add(feature)
    db.commit()
    db.refresh(feature)
    return feature

@router.get("/requirements/{req_id}/epics/{epic_id}/features/{feature_id}", response_model=FeatureRead)
def read_feature(*, project_id: int, req_id: int, epic_id: int, feature_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    feature = db.get(Feature, feature_id)
    if not feature or feature.project_id != project_id or feature.parent_epic_id != epic_id:
        raise HTTPException(status_code=404, detail="Feature not found")
    return feature

@router.put("/requirements/{req_id}/epics/{epic_id}/features/{feature_id}", response_model=FeatureRead)
def update_feature(*, project_id: int, req_id: int, epic_id: int, feature_id: int, feature_in: FeatureUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    feature = db.get(Feature, feature_id)
    if not feature or feature.project_id != project_id or feature.parent_epic_id != epic_id:
        raise HTTPException(status_code=404, detail="Feature not found")
    data = feature_in.dict(exclude_unset=True)
    data.pop("project_id", None)
    data.pop("parent_epic_id", None)
    for key, value in data.items():
        setattr(feature, key, value)
    db.add(feature)
    db.commit()
    db.refresh(feature)
    return feature

@router.delete("/requirements/{req_id}/epics/{epic_id}/features/{feature_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feature(*, project_id: int, req_id: int, epic_id: int, feature_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    feature = db.get(Feature, feature_id)
    if not feature or feature.project_id != project_id or feature.parent_epic_id != epic_id:
        raise HTTPException(status_code=404, detail="Feature not found")
    db.delete(feature)
    db.commit()
    return None

# -- User Stories --
@router.get("/epics/{epic_id}/features/{feature_id}/stories/", response_model=list[UserStoryRead])
def list_stories(*, project_id: int, req_id: int, epic_id: int, feature_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.exec(select(UserStory).where(UserStory.parent_feature_id == feature_id, UserStory.project_id == project_id)).all()

@router.post("/epics/{epic_id}/features/{feature_id}/stories/", response_model=UserStoryRead)
def create_story(*, project_id: int, req_id: int, epic_id: int, feature_id: int, story_in: UserStoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = story_in.dict()
    data.update({"project_id": project_id, "parent_feature_id": feature_id})
    story = UserStory(**data)
    db.add(story)
    db.commit()
    db.refresh(story)
    return story

@router.get("/epics/{epic_id}/features/{feature_id}/stories/{story_id}", response_model=UserStoryRead)
def read_story(*, project_id: int, req_id: int, epic_id: int, feature_id: int, story_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    story = db.get(UserStory, story_id)
    if not story or story.project_id != project_id or story.parent_feature_id != feature_id:
        raise HTTPException(status_code=404, detail="User Story not found")
    return story

@router.put("/epics/{epic_id}/features/{feature_id}/stories/{story_id}", response_model=UserStoryRead)
def update_story(*, project_id: int, req_id: int, epic_id: int, feature_id: int, story_id: int, story_in: UserStoryUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    story = db.get(UserStory, story_id)
    if not story or story.project_id != project_id or story.parent_feature_id != feature_id:
        raise HTTPException(status_code=404, detail="User Story not found")
    data = story_in.dict(exclude_unset=True)
    data.pop("project_id", None)
    data.pop("parent_feature_id", None)
    for key, value in data.items():
        setattr(story, key, value)
    db.add(story)
    db.commit()
    db.refresh(story)
    return story

@router.delete("/epics/{epic_id}/features/{feature_id}/stories/{story_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_story(*, project_id: int, req_id: int, epic_id: int, feature_id: int, story_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    story = db.get(UserStory, story_id)
    if not story or story.project_id != project_id or story.parent_feature_id != feature_id:
        raise HTTPException(status_code=404, detail="User Story not found")
    db.delete(story)
    db.commit()
    return None

# -- Use Cases --
@router.get("/features/{feature_id}/stories/{story_id}/usecases/", response_model=list[UseCaseRead])
def list_usecases(*, project_id: int, req_id: int, epic_id: int, feature_id: int, story_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.exec(select(UseCase).where(UseCase.parent_story_id == story_id, UseCase.project_id == project_id)).all()

@router.post("/features/{feature_id}/stories/{story_id}/usecases/", response_model=UseCaseRead)
def create_usecase(*, project_id: int, req_id: int, epic_id: int, feature_id: int, story_id: int, usecase_in: UseCaseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = usecase_in.dict()
    data.update({"project_id": project_id, "parent_story_id": story_id})
    use_case = UseCase(**data)
    db.add(use_case)
    db.commit()
    db.refresh(use_case)
    return use_case

@router.get("/features/{feature_id}/stories/{story_id}/usecases/{usecase_id}", response_model=UseCaseRead)
def read_usecase(*, project_id: int, req_id: int, epic_id: int, feature_id: int, story_id: int, usecase_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    use_case = db.get(UseCase, usecase_id)
    if not use_case or use_case.project_id != project_id or use_case.parent_story_id != story_id:
        raise HTTPException(status_code=404, detail="Use Case not found")
    return use_case

@router.put("/features/{feature_id}/stories/{story_id}/usecases/{usecase_id}", response_model=UseCaseRead)
def update_usecase(*, project_id: int, req_id: int, epic_id: int, feature_id: int, story_id: int, usecase_id: int, usecase_in: UseCaseUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    use_case = db.get(UseCase, usecase_id)
    if not use_case or use_case.project_id != project_id or use_case.parent_story_id != story_id:
        raise HTTPException(status_code=404, detail="Use Case not found")
    data = usecase_in.dict(exclude_unset=True)
    data.pop("project_id", None)
    data.pop("parent_story_id", None)
    for key, value in data.items():
        setattr(use_case, key, value)
    db.add(use_case)
    db.commit()
    db.refresh(use_case)
    return use_case

@router.delete("/features/{feature_id}/stories/{story_id}/usecases/{usecase_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_usecase(*, project_id: int, req_id: int, epic_id: int, feature_id: int, story_id: int, usecase_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    use_case = db.get(UseCase, usecase_id)
    if not use_case or use_case.project_id != project_id or use_case.parent_story_id != story_id:
        raise HTTPException(status_code=404, detail="Use Case not found")
    db.delete(use_case)
    db.commit()
    return None
