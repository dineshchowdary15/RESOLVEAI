import json
import os

from dotenv import load_dotenv
from ollama import Client
from pydantic import ValidationError

from app.models.analysis import (
    IncidentAnalysisRequest,
    IncidentAnalysisResponse,
    LLMIncidentAnalysis,
)


load_dotenv()


class LLMServiceError(RuntimeError):
    pass


SYSTEM_PROMPT = """
You are the incident analysis engine for ResolveAI,
a software engineering incident-resolution platform.

Analyze only the information explicitly provided
in the incident title and description.

IMPORTANT EVIDENCE RULES:

- Do not invent facts.
- Do not assume the issue is in production unless stated.
- Do not assume all users are affected unless stated.
- Do not claim an outage unless stated.
- Do not claim data loss unless stated.
- Do not claim authentication is completely unavailable
  unless the incident explicitly says so.
- Possible causes must be hypotheses, not confirmed facts.
- If impact is unclear, choose the less severe reasonable
  priority.

Your responsibilities:

1. Classify the incident into exactly one category:
   Backend, Frontend, Database, DevOps, Cloud,
   Security, or General.

2. Predict priority:
   LOW, MEDIUM, HIGH, or CRITICAL.

3. Write a concise technical summary using only
   information provided in the incident.

4. Identify 2-4 plausible technical causes.

5. Recommend 3-5 concrete troubleshooting actions.

6. Provide confidence between 0 and 1.

Priority rules:

CRITICAL:
Only use when the incident explicitly indicates
a production-wide outage, serious data loss,
security compromise, or essential service outage.

HIGH:
Major functionality failure, repeated HTTP 500
errors, significant timeouts, or clear user impact.

MEDIUM:
Partial degradation, intermittent issue, or
limited operational impact.

LOW:
Minor, cosmetic, or low-impact issue.

Do not claim a possible cause has been confirmed.
Treat causes as engineering hypotheses.
"""


def analyze_incident_with_llm(
    incident: IncidentAnalysisRequest,
) -> IncidentAnalysisResponse:

    model = os.getenv(
        "OLLAMA_MODEL",
        "qwen3:4b",
    )

    client = Client(
        host="http://localhost:11434"
    )

    user_prompt = f"""
Analyze this incident.

Ticket ID:
{incident.ticket_id}

Title:
{incident.title}

Description:
{incident.description}
"""

    try:

        response = client.chat(
            model=model,

            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],

            format=(
                LLMIncidentAnalysis
                .model_json_schema()
            ),

            options={
                "temperature": 0.2,
            },
        )

        raw_content = (
            response.message.content
        )

        raw_data = json.loads(
            raw_content
        )

        analysis = (
            LLMIncidentAnalysis
            .model_validate(raw_data)
        )

        return IncidentAnalysisResponse(
            ticket_id=incident.ticket_id,
            category=analysis.category,
            predicted_priority=(
                analysis.predicted_priority
            ),
            summary=analysis.summary,
            possible_causes=(
                analysis.possible_causes
            ),
            recommended_actions=(
                analysis.recommended_actions
            ),
            confidence=analysis.confidence,
        )

    except (
        Exception,
        json.JSONDecodeError,
        ValidationError,
    ) as exception:

        raise LLMServiceError(
            "Local LLM analysis failed"
        ) from exception