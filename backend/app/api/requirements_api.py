from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.deps import get_db, get_current_user
from app.models.requirements import Requirement, Epic, Feature, UserStory, UseCase # Import the models
from app.models.user import User # To use current_user
from app.schemas.requirements import ( # Import schemas
    RequirementCreate, RequirementRead, RequirementUpdate,
    EpicCreate, EpicRead, EpicUpdate,
    FeatureCreate, FeatureRead, FeatureUpdate,
    UserStoryCreate, UserStoryRead, UserStoryUpdate,
    UseCaseCreate, UseCaseRead, UseCaseUpdate
)

router = APIRouter(prefix="/requirements", tags=["Requirements Management"])

@router.post("/", response_model=RequirementRead)
def create_requirement(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user), # Add current_user dependency
    requirement_in: RequirementCreate
):
    # TODO: Potentially add authorization: check if current_user has rights to add to project_id
    requirement = Requirement.from_orm(requirement_in)
    db.add(requirement)
    db.commit()
    db.refresh(requirement)
    return requirement

@router.get("/", response_model=list[RequirementRead])
def read_requirements(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # Add current_user dependency
    # TODO: Add filtering by project_id based on user's projects
):
    requirements = db.exec(select(Requirement)).all() # Simplified: lists all requirements
    return requirements

@router.get("/{requirement_id}", response_model=RequirementRead)
def read_requirement(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user), # Add current_user dependency
    requirement_id: int
):
    requirement = db.get(Requirement, requirement_id)
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")
    # TODO: Add authorization: check if current_user has rights to view this requirement (e.g., part of the project)
    return requirement

@router.put("/{requirement_id}", response_model=RequirementRead)
def update_requirement(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user), # Add current_user dependency
    requirement_id: int,
    requirement_in: RequirementUpdate
):
    requirement = db.get(Requirement, requirement_id)
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")
    # TODO: Add authorization: check if current_user has rights to update this requirement

    update_data = requirement_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(requirement, key, value)

    db.add(requirement)
    db.commit()
    db.refresh(requirement)
    return requirement

@router.delete("/{requirement_id}")
def delete_requirement(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user), # Add current_user dependency
    requirement_id: int
):
    requirement = db.get(Requirement, requirement_id)
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")
    # TODO: Add authorization: check if current_user has rights to delete this requirement

    db.delete(requirement)
    db.commit()
    return {"ok": True, "detail": "Requirement deleted successfully"}

# Epic Endpoints
@router.post("/epics", response_model=EpicRead) # Changed prefix to avoid clash if mounting directly
def create_epic(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    epic_in: EpicCreate
):
    # TODO: Validate parent_req_id exists and belongs to project_id and user has access
    epic = Epic.from_orm(epic_in)
    db.add(epic)
    db.commit()
    db.refresh(epic)
    return epic

@router.get("/epics", response_model=list[EpicRead])
def read_epics(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
    # TODO: Add filtering by project_id or parent_req_id
):
    epics = db.exec(select(Epic)).all() # Simplified: lists all epics
    return epics

@router.get("/epics/{epic_id}", response_model=EpicRead)
def read_epic(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    epic_id: int
):
    epic = db.get(Epic, epic_id)
    if not epic:
        raise HTTPException(status_code=404, detail="Epic not found")
    # TODO: Authorization: check user access
    return epic

@router.put("/epics/{epic_id}", response_model=EpicRead)
def update_epic(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    epic_id: int,
    epic_in: EpicUpdate
):
    epic = db.get(Epic, epic_id)
    if not epic:
        raise HTTPException(status_code=404, detail="Epic not found")
    # TODO: Authorization: check user access
    # TODO: Validate parent_req_id if changed

    update_data = epic_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(epic, key, value)

    db.add(epic)
    db.commit()
    db.refresh(epic)
    return epic

@router.delete("/epics/{epic_id}")
def delete_epic(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    epic_id: int
):
    epic = db.get(Epic, epic_id)
    if not epic:
        raise HTTPException(status_code=404, detail="Epic not found")
    # TODO: Authorization: check user access

    db.delete(epic)
    db.commit()
    return {"ok": True, "detail": "Epic deleted successfully"}

# Feature Endpoints
@router.post("/features", response_model=FeatureRead) # Using /features path
def create_feature(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    feature_in: FeatureCreate
):
    # TODO: Validate parent_epic_id exists and belongs to project_id and user has access
    feature = Feature.from_orm(feature_in)
    db.add(feature)
    db.commit()
    db.refresh(feature)
    return feature

@router.get("/features", response_model=list[FeatureRead])
def read_features(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
    # TODO: Add filtering by project_id or parent_epic_id
):
    features = db.exec(select(Feature)).all() # Simplified: lists all features
    return features

@router.get("/features/{feature_id}", response_model=FeatureRead)
def read_feature(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    feature_id: int
):
    feature = db.get(Feature, feature_id)
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    # TODO: Authorization: check user access
    return feature

@router.put("/features/{feature_id}", response_model=FeatureRead)
def update_feature(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    feature_id: int,
    feature_in: FeatureUpdate
):
    feature = db.get(Feature, feature_id)
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    # TODO: Authorization: check user access
    # TODO: Validate parent_epic_id if changed

    update_data = feature_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(feature, key, value)

    db.add(feature)
    db.commit()
    db.refresh(feature)
    return feature

@router.delete("/features/{feature_id}")
def delete_feature(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    feature_id: int
):
    feature = db.get(Feature, feature_id)
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    # TODO: Authorization: check user access

    db.delete(feature)
    db.commit()
    return {"ok": True, "detail": "Feature deleted successfully"}

# UserStory Endpoints
@router.post("/userstories", response_model=UserStoryRead) # Using /userstories path
def create_user_story(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_story_in: UserStoryCreate
):
    # TODO: Validate parent_feature_id exists and belongs to project_id and user has access
    user_story = UserStory.from_orm(user_story_in)
    db.add(user_story)
    db.commit()
    db.refresh(user_story)
    return user_story

@router.get("/userstories", response_model=list[UserStoryRead])
def read_user_stories(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
    # TODO: Add filtering by project_id or parent_feature_id
):
    user_stories = db.exec(select(UserStory)).all() # Simplified: lists all user stories
    return user_stories

@router.get("/userstories/{user_story_id}", response_model=UserStoryRead)
def read_user_story(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_story_id: int
):
    user_story = db.get(UserStory, user_story_id)
    if not user_story:
        raise HTTPException(status_code=404, detail="UserStory not found")
    # TODO: Authorization: check user access
    return user_story

@router.put("/userstories/{user_story_id}", response_model=UserStoryRead)
def update_user_story(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_story_id: int,
    user_story_in: UserStoryUpdate
):
    user_story = db.get(UserStory, user_story_id)
    if not user_story:
        raise HTTPException(status_code=404, detail="UserStory not found")
    # TODO: Authorization: check user access
    # TODO: Validate parent_feature_id if changed

    update_data = user_story_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user_story, key, value)

    db.add(user_story)
    db.commit()
    db.refresh(user_story)
    return user_story

@router.delete("/userstories/{user_story_id}")
def delete_user_story(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_story_id: int
):
    user_story = db.get(UserStory, user_story_id)
    if not user_story:
        raise HTTPException(status_code=404, detail="UserStory not found")
    # TODO: Authorization: check user access

    db.delete(user_story)
    db.commit()
    return {"ok": True, "detail": "UserStory deleted successfully"}

# UseCase Endpoints
@router.post("/usecases", response_model=UseCaseRead) # Using /usecases path
def create_use_case(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    use_case_in: UseCaseCreate
):
    # TODO: Validate parent_story_id exists and belongs to project_id and user has access
    use_case = UseCase.from_orm(use_case_in)
    db.add(use_case)
    db.commit()
    db.refresh(use_case)
    return use_case

@router.get("/usecases", response_model=list[UseCaseRead])
def read_use_cases(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
    # TODO: Add filtering by project_id or parent_story_id
):
    use_cases = db.exec(select(UseCase)).all() # Simplified: lists all use cases
    return use_cases

@router.get("/usecases/{use_case_id}", response_model=UseCaseRead)
def read_use_case(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    use_case_id: int
):
    use_case = db.get(UseCase, use_case_id)
    if not use_case:
        raise HTTPException(status_code=404, detail="UseCase not found")
    # TODO: Authorization: check user access
    return use_case

@router.put("/usecases/{use_case_id}", response_model=UseCaseRead)
def update_use_case(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    use_case_id: int,
    use_case_in: UseCaseUpdate
):
    use_case = db.get(UseCase, use_case_id)
    if not use_case:
        raise HTTPException(status_code=404, detail="UseCase not found")
    # TODO: Authorization: check user access
    # TODO: Validate parent_story_id if changed

    update_data = use_case_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(use_case, key, value)

    db.add(use_case)
    db.commit()
    db.refresh(use_case)
    return use_case

@router.delete("/usecases/{use_case_id}")
def delete_use_case(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    use_case_id: int
):
    use_case = db.get(UseCase, use_case_id)
    if not use_case:
        raise HTTPException(status_code=404, detail="UseCase not found")
    # TODO: Authorization: check user access

    db.delete(use_case)
    db.commit()
    return {"ok": True, "detail": "UseCase deleted successfully"}
