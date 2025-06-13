from typing import Optional
from sqlmodel import SQLModel

# Requirement Schemas
class RequirementBase(SQLModel):
    title: str
    description: Optional[str] = None
    project_id: int
    is_active: bool = True

class RequirementCreate(RequirementBase):
    pass

class RequirementRead(RequirementBase):
    id: int

class RequirementUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    project_id: Optional[int] = None # Or decide if project_id can be changed
    is_active: Optional[bool] = None

# Placeholder for other schemas (Epic, Feature, etc.) to be added later

# Epic Schemas
class EpicBase(SQLModel):
    title: str
    description: Optional[str] = None
    project_id: int
    parent_req_id: int # Foreign key to Requirement
    is_active: bool = True

class EpicCreate(EpicBase):
    pass

class EpicRead(EpicBase):
    id: int

class EpicUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    project_id: Optional[int] = None
    parent_req_id: Optional[int] = None
    is_active: Optional[bool] = None

# Feature Schemas
class FeatureBase(SQLModel):
    title: str
    description: Optional[str] = None
    project_id: int
    parent_epic_id: int # Foreign key to Epic
    is_active: bool = True

class FeatureCreate(FeatureBase):
    pass

class FeatureRead(FeatureBase):
    id: int

class FeatureUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    project_id: Optional[int] = None
    parent_epic_id: Optional[int] = None
    is_active: Optional[bool] = None

# UserStory Schemas
class UserStoryBase(SQLModel):
    title: str
    description: Optional[str] = None
    project_id: int
    parent_feature_id: int # Foreign key to Feature
    acceptance_criteria: Optional[str] = None
    is_active: bool = True

class UserStoryCreate(UserStoryBase):
    pass

class UserStoryRead(UserStoryBase):
    id: int

class UserStoryUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    project_id: Optional[int] = None
    parent_feature_id: Optional[int] = None
    acceptance_criteria: Optional[str] = None
    is_active: Optional[bool] = None

# UseCase Schemas
class UseCaseBase(SQLModel):
    title: str
    description: Optional[str] = None
    project_id: int
    parent_story_id: int # Foreign key to UserStory
    steps: Optional[str] = None
    is_active: bool = True

class UseCaseCreate(UseCaseBase):
    pass

class UseCaseRead(UseCaseBase):
    id: int

class UseCaseUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    project_id: Optional[int] = None
    parent_story_id: Optional[int] = None
    steps: Optional[str] = None
    is_active: Optional[bool] = None
