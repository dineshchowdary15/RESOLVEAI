from fastapi import APIRouter

from app.models.analysis import (
    IncidentAnalysisRequest,
    IncidentAnalysisResponse,
)

from app.services.analyzer import analyze_incident


router = APIRouter(
    prefix="/internal",
    tags=["AI Analysis"],
)


@router.post(
    "/analyze",
    response_model=IncidentAnalysisResponse,
)
def analyze(
    incident: IncidentAnalysisRequest,
) -> IncidentAnalysisResponse:

    return analyze_incident(incident)