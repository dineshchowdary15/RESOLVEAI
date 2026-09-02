from pydantic import BaseModel, Field


class DuplicateSearchRequest(BaseModel):

    title: str = Field(
        min_length=1
    )

    description: str = Field(
        min_length=1
    )

    exclude_ticket_id: int | None = None

    top_k: int = Field(
        default=3,
        ge=1,
        le=10,
    )


class DuplicateIncidentResult(BaseModel):

    ticket_id: int

    title: str

    description: str

    similarity: float


class DuplicateSearchResponse(BaseModel):

    potential_duplicate: bool

    threshold: float

    results: list[
        DuplicateIncidentResult
    ]


class TicketIndexRequest(BaseModel):

    ticket_id: int

    title: str = Field(
        min_length=1
    )

    description: str = Field(
        min_length=1
    )