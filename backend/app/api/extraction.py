from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.schema import ExtractionSchema
from app.models.result import ExtractionResult
from app.services.extraction import fetch_file_from_s3, extract_from_document
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/extraction", tags=["extraction"])

class ExtractionRequest(BaseModel):
    document_id: str
    schema_id: str

class ExtractionResultResponse(BaseModel):
    id: str
    document_id: str
    schema_id: str
    extracted_data: Optional[dict]
    confidence_score: Optional[float]
    status: str
    error_message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=ExtractionResultResponse, status_code=201)
def run_extraction(
    request: ExtractionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(
        Document.id == request.document_id,
        Document.user_id == current_user.id
    ).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    schema = db.query(ExtractionSchema).filter(
        ExtractionSchema.id == request.schema_id,
        ExtractionSchema.user_id == current_user.id
    ).first()
    if not schema:
        raise HTTPException(status_code=404, detail="Schema not found")

    result = ExtractionResult(
        document_id=document.id,
        schema_id=schema.id,
        status="processing"
    )
    db.add(result)
    db.commit()
    db.refresh(result)

    try:
        document.status = "processing"
        db.commit()

        file_bytes, content_type = fetch_file_from_s3(document.storage_path)
        extracted_data, confidence_score = extract_from_document(
            file_bytes=file_bytes,
            content_type=content_type,
            fields=schema.fields
        )

        result.extracted_data = extracted_data
        result.confidence_score = confidence_score
        result.status = "completed"
        document.status = "completed"
        db.commit()
        db.refresh(result)

    except Exception as e:
        result.status = "failed"
        result.error_message = str(e)
        document.status = "failed"
        db.commit()
        db.refresh(result)

    return result

@router.get("/results/{document_id}", response_model=List[ExtractionResultResponse])
def get_document_results(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    results = db.query(ExtractionResult).filter(
        ExtractionResult.document_id == document_id
    ).order_by(ExtractionResult.created_at.desc()).all()
    return results