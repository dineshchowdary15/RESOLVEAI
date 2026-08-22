from app.models.analysis import IncidentAnalysisRequest
from app.services.analyzer import analyze_incident


def test_backend_incident_analysis():

    request = IncidentAnalysisRequest(
        ticket_id=1,
        title="Authentication API timeout",
        description=(
            "Authentication API requests "
            "are timing out."
        ),
    )

    result = analyze_incident(request)

    assert result.ticket_id == 1
    assert result.category == "Backend"
    assert result.predicted_priority == "HIGH"
    assert len(result.possible_causes) > 0
    assert len(result.recommended_actions) > 0


def test_database_incident_analysis():

    request = IncidentAnalysisRequest(
        ticket_id=2,
        title="Database connections exhausted",
        description=(
            "Application cannot obtain "
            "PostgreSQL connections."
        ),
    )

    result = analyze_incident(request)

    assert result.category == "Database"