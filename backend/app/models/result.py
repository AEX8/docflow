import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, JSON, Float, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class ExtractionResult(Base):
    __tablename__ = "extraction_results"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    document_id: Mapped[str] = mapped_column(String, ForeignKey("documents.id"), nullable=False)
    schema_id: Mapped[str] = mapped_column(String, ForeignKey("extraction_schemas.id"), nullable=False)
    extracted_data: Mapped[dict] = mapped_column(JSON, nullable=True)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    error_message: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    document: Mapped["Document"] = relationship("Document", back_populates="results")
    schema: Mapped["ExtractionSchema"] = relationship("ExtractionSchema", back_populates="results")