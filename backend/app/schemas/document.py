from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class DocumentStatus(str, Enum):
    uploaded = "uploaded"
    processing = "processing"
    completed = "completed"
    failed = "failed"

class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    status: DocumentStatus
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentWithURL(DocumentResponse):
    download_url: str