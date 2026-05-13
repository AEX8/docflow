from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class SchemaField(BaseModel):
    name: str
    type: str
    description: str
    required: bool = True

class ExtractionSchemaCreate(BaseModel):
    name: str
    description: Optional[str] = None
    fields: List[SchemaField]

class ExtractionSchemaResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    fields: List[dict]
    created_at: datetime

    class Config:
        from_attributes = True