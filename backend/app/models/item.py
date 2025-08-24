from __future__ import annotations

from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class ItemType(str, Enum):
    EPIC = "Epic"
    CAPABILITY = "Capability"
    FEATURE = "Feature"
    US = "US"
    UC = "UC"


class Item(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    type: ItemType
    title: str
    description: Optional[str] = None
    status: str = "draft"
    parent_id: Optional[int] = Field(default=None, foreign_key="item.id")
