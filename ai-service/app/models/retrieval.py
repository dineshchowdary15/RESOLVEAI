from pydantic import BaseModel, Field


class KnowledgeSearchRequest(
    BaseModel
):

    query: str = Field(
        min_length=1
    )

    top_k: int = Field(
        default=3,
        ge=1,
        le=10,
    )


class KnowledgeSearchResult(
    BaseModel
):

    chunk_id: int
    document_title: str
    content: str
    similarity: float


class KnowledgeSearchResponse(
    BaseModel
):

    query: str

    results: list[
        KnowledgeSearchResult
    ]