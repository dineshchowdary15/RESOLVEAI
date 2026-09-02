from fastapi import (
    APIRouter,
    Response,
    status,
)

from app.models.duplicates import (
    DuplicateIncidentResult,
    DuplicateSearchRequest,
    DuplicateSearchResponse,
    TicketIndexRequest,
)

from app.services.duplicate_service import (
    DUPLICATE_THRESHOLD,
    find_duplicate_incidents,
    index_ticket,
)


router = APIRouter(
    prefix="/internal/duplicates",
    tags=["Duplicate Detection"],
)


@router.post(
    "/search",
    response_model=DuplicateSearchResponse,
)
def search_duplicates(
    request: DuplicateSearchRequest,
) -> DuplicateSearchResponse:

    matches = find_duplicate_incidents(
        title=request.title,
        description=request.description,
        top_k=request.top_k,
        exclude_ticket_id=(
            request.exclude_ticket_id
        ),
    )

    results = [
        DuplicateIncidentResult(
            ticket_id=match[
                "ticket_id"
            ],
            title=match[
                "title"
            ],
            description=match[
                "description"
            ],
            similarity=match[
                "similarity"
            ],
        )
        for match in matches
    ]

    potential_duplicate = any(
        result.similarity
        >= DUPLICATE_THRESHOLD
        for result in results
    )

    return DuplicateSearchResponse(
        potential_duplicate=(
            potential_duplicate
        ),
        threshold=(
            DUPLICATE_THRESHOLD
        ),
        results=results,
    )


@router.post(
    "/index",
    status_code=status.HTTP_204_NO_CONTENT,
)
def index_incident(
    request: TicketIndexRequest,
) -> Response:

    index_ticket(
        ticket_id=request.ticket_id,
        title=request.title,
        description=request.description,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )