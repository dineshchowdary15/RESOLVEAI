import logging
import os

from app.models.analysis import (
    IncidentAnalysisRequest,
    IncidentAnalysisResponse,
    KnowledgeSource,
)

from app.services.guardrail_service import (
    apply_analysis_guardrails,
)

from app.services.llm_service import (
    analyze_incident_with_llm,
)

from app.services.retrieval_service import (
    retrieve_relevant_chunks,
)


logger = logging.getLogger(__name__)


# Minimum semantic similarity required
# before a knowledge chunk is used for RAG.
MIN_SIMILARITY = 0.65


def analyze_incident_rule_based(
    incident: IncidentAnalysisRequest,
) -> IncidentAnalysisResponse:

    text = (
        f"{incident.title} "
        f"{incident.description}"
    ).lower()

    category = determine_category(text)

    priority = determine_priority(text)

    causes = determine_possible_causes(
        category,
        text,
    )

    actions = determine_recommended_actions(
        category
    )

    summary = (
        f"The incident '{incident.title}' "
        f"appears to be related to the "
        f"{category.lower()} layer and "
        f"requires investigation."
    )

    return IncidentAnalysisResponse(
        ticket_id=incident.ticket_id,
        category=category,
        predicted_priority=priority,
        summary=summary,
        possible_causes=causes,
        recommended_actions=actions,
        confidence=0.82,
        knowledge_sources=[],
    )


def determine_category(
    text: str,
) -> str:

    if any(
        keyword in text
        for keyword in [
            "database",
            "postgres",
            "mysql",
            "connection pool",
            "sql",
        ]
    ):
        return "Database"

    if any(
        keyword in text
        for keyword in [
            "react",
            "frontend",
            "browser",
            "ui",
            "page",
        ]
    ):
        return "Frontend"

    if any(
        keyword in text
        for keyword in [
            "kubernetes",
            "docker",
            "pod",
            "container",
            "deployment",
        ]
    ):
        return "DevOps"

    if any(
        keyword in text
        for keyword in [
            "api",
            "spring",
            "backend",
            "authentication",
            "server",
        ]
    ):
        return "Backend"

    return "General"


def determine_priority(
    text: str,
) -> str:

    if any(
        keyword in text
        for keyword in [
            "outage",
            "critical",
            "production down",
            "all users",
            "data loss",
        ]
    ):
        return "CRITICAL"

    if any(
        keyword in text
        for keyword in [
            "timeout",
            "500",
            "failed",
            "failure",
            "unable",
        ]
    ):
        return "HIGH"

    return "MEDIUM"


def determine_possible_causes(
    category: str,
    text: str,
) -> list[str]:

    causes_by_category = {

        "Backend": [
            "Recent deployment introduced a regression",
            "Dependent service is unavailable or responding slowly",
            "Application configuration is incorrect",
        ],

        "Database": [
            "Database connection pool exhaustion",
            "Database service connectivity problem",
            "Incorrect database credentials or configuration",
        ],

        "Frontend": [
            "Frontend runtime or JavaScript error",
            "API request from the client is failing",
            "Recent frontend deployment introduced a regression",
        ],

        "DevOps": [
            "Container environment configuration is invalid",
            "Kubernetes readiness or liveness probe is failing",
            "Required dependency is unavailable during startup",
        ],

        "General": [
            "Recent application configuration change",
            "Dependency failure",
            "Unexpected application runtime error",
        ],
    }

    return causes_by_category[category]


def determine_recommended_actions(
    category: str,
) -> list[str]:

    actions_by_category = {

        "Backend": [
            "Inspect application logs for exceptions",
            "Review the most recent backend deployment",
            "Verify dependent service connectivity",
        ],

        "Database": [
            "Check active database connections",
            "Verify database credentials and network access",
            "Inspect database and application logs",
        ],

        "Frontend": [
            "Inspect browser developer console errors",
            "Review failed network requests",
            "Compare behavior with the previous frontend release",
        ],

        "DevOps": [
            "Inspect Kubernetes pod logs",
            "Review pod events and deployment configuration",
            "Verify environment variables, secrets, and dependencies",
        ],

        "General": [
            "Inspect relevant application logs",
            "Review recent configuration changes",
            "Reproduce the issue in a controlled environment",
        ],
    }

    return actions_by_category[category]


def analyze_incident(
    incident: IncidentAnalysisRequest,
) -> IncidentAnalysisResponse:

    use_llm = (
        os.getenv(
            "USE_LLM",
            "true",
        ).lower()
        == "true"
    )

    # --------------------------------
    # LLM disabled
    # --------------------------------

    if not use_llm:

        return analyze_incident_rule_based(
            incident
        )

    try:

        # --------------------------------
        # 1. Build retrieval query
        # --------------------------------

        query = (
            f"{incident.title}. "
            f"{incident.description}"
        )

        # --------------------------------
        # 2. Retrieve candidate chunks
        # --------------------------------

        retrieved_chunks = (
            retrieve_relevant_chunks(
                query=query,
                top_k=6,
            )
        )

        # --------------------------------
        # 3. Remove weak matches
        # --------------------------------

        retrieved_chunks = [
            chunk
            for chunk in retrieved_chunks
            if chunk.similarity
            >= MIN_SIMILARITY
        ]

        # --------------------------------
        # 4. Remove duplicate documents
        #
        # Keep only the strongest chunk
        # from each document.
        # --------------------------------

        unique_chunks = {}

        for chunk in retrieved_chunks:

            existing = unique_chunks.get(
                chunk.document_title
            )

            if (
                existing is None
                or chunk.similarity
                > existing.similarity
            ):

                unique_chunks[
                    chunk.document_title
                ] = chunk

        retrieved_chunks = sorted(
            unique_chunks.values(),
            key=lambda chunk:
                chunk.similarity,
            reverse=True,
        )[:3]

        # --------------------------------
        # 5. Build RAG context
        # --------------------------------

        knowledge_context_parts = []

        for index, chunk in enumerate(
            retrieved_chunks,
            start=1,
        ):

            knowledge_context_parts.append(
                f"""
Knowledge document {index}

Title:
{chunk.document_title}

Content:
{chunk.content}
"""
            )

        knowledge_context = "\n".join(
            knowledge_context_parts
        )

        # --------------------------------
        # 6. Run local LLM
        # --------------------------------

        analysis = (
            analyze_incident_with_llm(
                incident=incident,
                knowledge_context=(
                    knowledge_context
                ),
            )
        )

        # --------------------------------
        # 7. Apply evidence guardrails
        # --------------------------------

        analysis = (
            apply_analysis_guardrails(
                incident,
                analysis,
            )
        )

        # --------------------------------
        # 8. Add retrieved sources
        # --------------------------------

        sources = [
            KnowledgeSource(
                document_title=(
                    chunk.document_title
                ),
                similarity=round(
                    chunk.similarity,
                    4,
                ),
            )
            for chunk in retrieved_chunks
        ]

        # --------------------------------
        # 9. Return final RAG result
        # --------------------------------

        return analysis.model_copy(
            update={
                "knowledge_sources":
                    sources
            }
        )

    except Exception as exception:

        logger.exception(
            "RAG/LLM analysis failed. "
            "Using rule-based fallback. "
            "Reason: %s",
            exception,
        )

        # IMPORTANT:
        # Call the existing rule engine.
        # Do not reference undefined
        # category/priority/etc variables.
        return analyze_incident_rule_based(
            incident
        )