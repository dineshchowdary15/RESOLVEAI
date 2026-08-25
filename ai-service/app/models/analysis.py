from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class IncidentAnalysisRequest(BaseModel):
    ticket_id: int
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)


class LLMIncidentAnalysis(BaseModel):

    model_config = ConfigDict(
        extra="forbid"
    )

    category: Literal[
        "Backend",
        "Frontend",
        "Database",
        "DevOps",
        "Cloud",
        "Security",
        "General",
    ]

    predicted_priority: Literal[
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
    ]

    summary: str

    possible_causes: list[str]

    recommended_actions: list[str]

    confidence: float = Field(
        ge=0.0,
        le=1.0,
    )


class IncidentAnalysisResponse(BaseModel):
    ticket_id: int
    category: str
    predicted_priority: str
    summary: str
    possible_causes: list[str]
    recommended_actions: list[str]
    confidence: float