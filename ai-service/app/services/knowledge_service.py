from pathlib import Path
from pgvector import Vector
from app.services.chunking_service import (
    chunk_text,
)

from app.services.database_service import (
    get_connection,
)

from app.services.embedding_service import (
    generate_embedding,
)


def ingest_document(
    file_path: Path,
) -> int:

    text = file_path.read_text(
        encoding="utf-8"
    )

    chunks = chunk_text(text)

    if not chunks:
        return 0

    with get_connection() as connection:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                INSERT INTO knowledge_documents
                    (title, source)
                VALUES
                    (%s, %s)
                RETURNING id
                """,
                (
                    file_path.stem,
                    str(file_path),
                ),
            )

            document_id = (
                cursor.fetchone()[0]
            )

            for index, chunk in enumerate(
                chunks
            ):

                embedding = Vector(
                    generate_embedding(
                        chunk
                    )
                )

                cursor.execute(
                    """
                    INSERT INTO knowledge_chunks
                        (
                            document_id,
                            chunk_index,
                            content,
                            embedding
                        )
                    VALUES
                        (%s, %s, %s, %s)
                    """,
                    (
                        document_id,
                        index,
                        chunk,
                        embedding,
                    ),
                )

        connection.commit()

    return len(chunks)


def ingest_directory(
    directory: Path,
) -> int:

    total_chunks = 0

    for file_path in sorted(
        directory.glob("*.md")
    ):

        count = ingest_document(
            file_path
        )

        print(
            f"Ingested {file_path.name}: "
            f"{count} chunks"
        )

        total_chunks += count

    return total_chunks