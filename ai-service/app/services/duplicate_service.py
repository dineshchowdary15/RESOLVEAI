from pgvector import Vector

from app.services.database_service import (
    get_connection,
)

from app.services.embedding_service import (
    generate_embedding,
)


DUPLICATE_THRESHOLD = 0.80


def build_ticket_text(
    title: str,
    description: str,
) -> str:

    return (
        f"{title.strip()}. "
        f"{description.strip()}"
    )


def index_ticket(
    ticket_id: int,
    title: str,
    description: str,
) -> None:

    content = build_ticket_text(
        title,
        description,
    )

    embedding = Vector(
        generate_embedding(
            content
        )
    )

    with get_connection() as connection:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                INSERT INTO ticket_embeddings
                    (
                        ticket_id,
                        content,
                        embedding,
                        updated_at
                    )

                VALUES
                    (
                        %s,
                        %s,
                        %s,
                        CURRENT_TIMESTAMP
                    )

                ON CONFLICT (ticket_id)
                DO UPDATE SET

                    content = EXCLUDED.content,

                    embedding = EXCLUDED.embedding,

                    updated_at =
                        CURRENT_TIMESTAMP
                """,
                (
                    ticket_id,
                    content,
                    embedding,
                ),
            )

        connection.commit()


def find_duplicate_incidents(
    title: str,
    description: str,
    top_k: int = 3,
    exclude_ticket_id: int | None = None,
):

    query_text = build_ticket_text(
        title,
        description,
    )

    query_embedding = Vector(
        generate_embedding(
            query_text
        )
    )

    with get_connection() as connection:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT
                    t.id,
                    t.title,
                    t.description,

                    1 - (
                        te.embedding <=> %s
                    ) AS similarity

                FROM ticket_embeddings te

                JOIN tickets t
                    ON t.id = te.ticket_id

                WHERE
                    (
                        CAST(%s AS BIGINT) IS NULL
                        OR t.id <> CAST(%s AS BIGINT)
                    )

                ORDER BY
                    te.embedding <=> %s

                LIMIT %s
                """,
                (
                    query_embedding,
                    exclude_ticket_id,
                    exclude_ticket_id,
                    query_embedding,
                    top_k,
                ),
            )

            rows = cursor.fetchall()

    return [
        {
            "ticket_id": row[0],
            "title": row[1],
            "description": row[2],
            "similarity": round(
                float(row[3]),
                4,
            ),
        }
        for row in rows
    ]