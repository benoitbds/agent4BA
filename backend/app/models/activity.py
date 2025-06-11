from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class Activity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    type: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
