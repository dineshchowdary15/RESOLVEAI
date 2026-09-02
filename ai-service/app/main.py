from fastapi import FastAPI

from app.api.analysis import router as analysis_router
from app.api.knowledge import router as knowledge_router
from app.api.duplicates import (router as duplicates_router,)


app = FastAPI(
    title="ResolveAI AI Service",
    description=(
        "AI analysis microservice for the "
        "ResolveAI Incident Resolution Platform"
    ),
    version="1.0.0",
)


@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "resolveai-ai-service",
    }


app.include_router(analysis_router)
app.include_router(knowledge_router)
app.include_router(duplicates_router)