from datetime import datetime
from pydantic import BaseModel

class ActivityRead(BaseModel):
    id: int
    project_id: int
    type: str
    content: str
    timestamp: datetime

    class Config:
        orm_mode = True
