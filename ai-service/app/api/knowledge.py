from fastapi import APIRouter

from app.models.retrieval import (
    KnowledgeSearchRequest,
    KnowledgeSearchResponse,
    KnowledgeSearchResult,
)

from app.services.retrieval_service import (
    retrieve_relevant_chunks,
)


router = APIRouter(
    prefix="/internal/knowledge",
    tags=["Knowledge"],
)


@router.post(
    "/search",
    response_model=KnowledgeSearchResponse,
)
def search_knowledge(
    request: KnowledgeSearchRequest,
) -> KnowledgeSearchResponse:

    chunks = retrieve_relevant_chunks(
        query=request.query,
        top_k=request.top_k,
    )

    results = [
        KnowledgeSearchResult(
            chunk_id=chunk.chunk_id,
            document_title=(
                chunk.document_title
            ),
            content=chunk.content,
            similarity=chunk.similarity,
        )
        for chunk in chunks
    ]

    return KnowledgeSearchResponse(
        query=request.query,
        results=results,
    )