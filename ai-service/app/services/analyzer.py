from app.models.analysis import (
    IncidentAnalysisRequest,
    IncidentAnalysisResponse,
)


def analyze_incident(
    incident: IncidentAnalysisRequest,
) -> IncidentAnalysisResponse:

    text = f"{incident.title} {incident.description}".lower()

    category = determine_category(text)

    priority = determine_priority(text)

    causes = determine_possible_causes(category, text)

    actions = determine_recommended_actions(category)

    summary = (
        f"The incident '{incident.title}' appears to be related "
        f"to the {category.lower()} layer and requires investigation."
    )

    return IncidentAnalysisResponse(
        ticket_id=incident.ticket_id,
        category=category,
        predicted_priority=priority,
        summary=summary,
        possible_causes=causes,
        recommended_actions=actions,
        confidence=0.82,
    )


def determine_category(text: str) -> str:

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


def determine_priority(text: str) -> str:

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