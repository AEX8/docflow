from fastapi import FastAPI
from app.core.database import engine
from app.models import User, Document, ExtractionSchema, ExtractionResult

app = FastAPI(
    title="DocFlow",
    description="Configurable document intelligence pipeline",
    version="0.1.0"
)

@app.on_event("startup")
async def startup():
    pass

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "docflow-backend"}