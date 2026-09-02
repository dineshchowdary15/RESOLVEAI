from dataclasses import dataclass

from pgvector import Vector

from app.services.database_service import (
    get_connection,
)

from app.services.embedding_service import (
    generate_embedding,
)


@dataclass
class RetrievedChunk:
    chunk_id: int
    document_title: str
    source: str | None
    content: str
    similarity: float


def retrieve_relevant_chunks(
    query: str,
    top_k: int = 3,
) -> list[RetrievedChunk]:

    # Generate embedding using Ollama
    query_embedding = generate_embedding(
        query
    )

    # Explicitly convert Python list to pgvector Vector
    vector = Vector(
        query_embedding
    )

    with get_connection() as connection:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT
                    kc.id,
                    kd.title,
                    kd.source,
                    kc.content,
                    1 - (
                        kc.embedding <=> %s
                    ) AS similarity
                FROM knowledge_chunks kc
                JOIN knowledge_documents kd
                    ON kd.id = kc.document_id
                ORDER BY
                    kc.embedding <=> %s
                LIMIT %s
                """,
                (
                    vector,
                    vector,
                    top_k,
                ),
            )

            rows = cursor.fetchall()

    return [
        RetrievedChunk(
            chunk_id=row[0],
            document_title=row[1],
            source=row[2],
            content=row[3],
            similarity=float(row[4]),
        )
        for row in rows
    ]