from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.schema import ExtractionSchema
from app.schemas.extraction_schema import ExtractionSchemaCreate, ExtractionSchemaResponse
from typing import List

router = APIRouter(prefix="/schemas", tags=["schemas"])

@router.post("/", response_model=ExtractionSchemaResponse, status_code=201)
def create_schema(
    schema_data: ExtractionSchemaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    schema = ExtractionSchema(
        user_id=current_user.id,
        name=schema_data.name,
        description=schema_data.description,
        fields=[field.model_dump() for field in schema_data.fields]
    )
    db.add(schema)
    db.commit()
    db.refresh(schema)
    return schema

@router.get("/", response_model=List[ExtractionSchemaResponse])
def list_schemas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    schemas = db.query(ExtractionSchema).filter(
        ExtractionSchema.user_id == current_user.id
    ).order_by(ExtractionSchema.created_at.desc()).all()
    return schemas

@router.get("/{schema_id}", response_model=ExtractionSchemaResponse)
def get_schema(
    schema_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    schema = db.query(ExtractionSchema).filter(
        ExtractionSchema.id == schema_id,
        ExtractionSchema.user_id == current_user.id
    ).first()
    if not schema:
        raise HTTPException(status_code=404, detail="Schema not found")
    return schema

@router.delete("/{schema_id}", status_code=204)
def delete_schema(
    schema_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    schema = db.query(ExtractionSchema).filter(
        ExtractionSchema.id == schema_id,
        ExtractionSchema.user_id == current_user.id
    ).first()
    if not schema:
        raise HTTPException(status_code=404, detail="Schema not found")
    db.delete(schema)
    db.commit()
    return None