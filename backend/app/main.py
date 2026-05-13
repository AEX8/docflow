from fastapi import FastAPI
from app.models import User, Document, ExtractionSchema, ExtractionResult
from app.api import auth, documents, schemas, extraction

app = FastAPI(
    title="DocFlow",
    description="Configurable document intelligence pipeline",
    version="0.1.0"
)

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(schemas.router)
app.include_router(extraction.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "docflow-backend"}