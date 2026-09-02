import re

from app.models.analysis import (
    IncidentAnalysisRequest,
    IncidentAnalysisResponse,
)


CRITICAL_EVIDENCE_TERMS = [
    "production down",
    "production-wide outage",
    "complete outage",
    "all users",
    "all customers",
    "service unavailable",
    "system unavailable",
    "complete failure",
    "data loss",
    "security breach",
    "security compromise",
]


def apply_analysis_guardrails(
    incident: IncidentAnalysisRequest,
    analysis: IncidentAnalysisResponse,
) -> IncidentAnalysisResponse:

    incident_text = (
        f"{incident.title} "
        f"{incident.description}"
    ).lower()

    summary = analysis.summary

    # -----------------------------
    # Prevent invented environment
    # -----------------------------

    if "production" not in incident_text:

        summary = re.sub(
            r"\bin production\b",
            "",
            summary,
            flags=re.IGNORECASE,
        )

        summary = re.sub(
            r"\bproduction\b",
            "",
            summary,
            flags=re.IGNORECASE,
        )

    # Clean double spaces caused by removal.
    summary = re.sub(
        r"\s{2,}",
        " ",
        summary,
    ).strip()

    # -----------------------------
    # Priority guardrail
    # -----------------------------

    predicted_priority = (
        analysis.predicted_priority
    )

    if predicted_priority == "CRITICAL":

        has_critical_evidence = any(
            term in incident_text
            for term in CRITICAL_EVIDENCE_TERMS
        )

        if not has_critical_evidence:
            predicted_priority = "HIGH"

    return analysis.model_copy(
        update={
            "summary": summary,
            "predicted_priority":
                predicted_priority,
        }
    )