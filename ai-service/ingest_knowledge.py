from pathlib import Path

from app.services.knowledge_service import (
    ingest_directory,
)


def main():

    knowledge_directory = Path(
        "knowledge"
    )

    if not knowledge_directory.exists():

        raise RuntimeError(
            "knowledge directory "
            "does not exist"
        )

    total_chunks = ingest_directory(
        knowledge_directory
    )

    print()
    print(
        "Knowledge ingestion complete."
    )

    print(
        f"Total chunks: "
        f"{total_chunks}"
    )


if __name__ == "__main__":
    main()