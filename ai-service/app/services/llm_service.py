import json
import os

from dotenv import load_dotenv
from ollama import Client

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

Analyze only information supported by the incident
and relevant internal troubleshooting knowledge.

GROUNDING RULES:

- Use retrieved internal documentation when relevant.
- Do not claim retrieved documentation proves a root cause.
- Treat possible causes as hypotheses.
- Do not invent production impact.
- Do not invent user impact.
- Do not invent outages or data loss.
- Do not invent configuration values.
- If retrieved knowledge is unrelated, ignore it.
- Recommendations should preferably be supported by the
  retrieved troubleshooting documentation.

Your responsibilities:

1. Classify the incident:
   Backend, Frontend, Database, DevOps,
   Cloud, Security, or General.

2. Predict priority:
   LOW, MEDIUM, HIGH, or CRITICAL.

3. Produce a concise technical summary.

4. Identify 2-4 plausible technical causes.

5. Recommend 3-5 troubleshooting actions.

6. Return confidence between 0 and 1.

Priority guidance:

CRITICAL:
Explicit production-wide outage, serious data loss,
security compromise, or essential service outage.

HIGH:
Major functionality failure, repeated HTTP 500 errors,
timeouts, or clear significant impact.

MEDIUM:
Partial degradation or limited operational impact.

LOW:
Minor or low-impact issue.
"""


def analyze_incident_with_llm(
    incident: IncidentAnalysisRequest,
    knowledge_context: str = "",
) -> IncidentAnalysisResponse:

    model = os.getenv(
        "OLLAMA_MODEL",
        "qwen3:4b",
    )

    ollama_host = os.getenv(
        "OLLAMA_HOST",
        "http://localhost:11434",
    )

    client = Client(
        host=ollama_host
    )

    user_prompt = f"""
Analyze the following software incident.

Ticket ID:
{incident.ticket_id}

Title:
{incident.title}

Description:
{incident.description}

Internal troubleshooting knowledge:

{knowledge_context}

Use the internal troubleshooting knowledge when it is
relevant to the incident.

Important:

- Do not invent facts that are not present in the incident.
- Treat retrieved knowledge as troubleshooting guidance,
  not proof of the root cause.
- Possible causes must remain hypotheses.
- Prefer recommendations supported by the retrieved
  troubleshooting knowledge.
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

        if not raw_content:
            raise LLMServiceError(
                "Local LLM returned an empty response"
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

    except LLMServiceError:
        raise

    except Exception as exception:

        raise LLMServiceError(
            "Local LLM analysis failed"
        ) from exception