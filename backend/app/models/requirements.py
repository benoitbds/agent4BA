from typing import Optional
from sqlmodel import SQLModel, Field


class Requirement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    project_id: int = Field(foreign_key="project.id")
    is_active: bool = True


class Epic(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    project_id: int = Field(foreign_key="project.id")
    parent_req_id: int = Field(foreign_key="requirement.id")
    is_active: bool = True


class Feature(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    project_id: int = Field(foreign_key="project.id")
    parent_epic_id: int = Field(foreign_key="epic.id")
    is_active: bool = True


class UserStory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    project_id: int = Field(foreign_key="project.id")
    parent_feature_id: int = Field(foreign_key="feature.id")
    acceptance_criteria: Optional[str] = None
    is_active: bool = True


class UseCase(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    project_id: int = Field(foreign_key="project.id")
    parent_story_id: int = Field(foreign_key="userstory.id")
    steps: Optional[str] = None
    is_active: bool = True
