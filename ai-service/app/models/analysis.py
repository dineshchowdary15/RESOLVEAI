from pydantic import BaseModel, Field


class IncidentAnalysisRequest(BaseModel):
    ticket_id: int
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)


class IncidentAnalysisResponse(BaseModel):
    ticket_id: int
    category: str
    predicted_priority: str
    summary: str
    possible_causes: list[str]
    recommended_actions: list[str]
    confidence: float