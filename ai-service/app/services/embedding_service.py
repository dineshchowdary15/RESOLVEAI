import os

from dotenv import load_dotenv
from ollama import Client


load_dotenv()


OLLAMA_HOST = os.getenv(
    "OLLAMA_HOST",
    "http://localhost:11434",
)


def generate_embedding(
    text: str,
) -> list[float]:

    model = os.getenv(
        "EMBEDDING_MODEL",
        "nomic-embed-text",
    )

    client = Client(
        host=OLLAMA_HOST
    )

    response = client.embed(
        model=model,
        input=text,
    )

    if not response.embeddings:

        raise RuntimeError(
            "Embedding model returned "
            "no embeddings"
        )

    return response.embeddings[0]