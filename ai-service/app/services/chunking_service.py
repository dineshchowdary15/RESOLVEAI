def chunk_text(
    text: str,
    chunk_size: int = 700,
    overlap: int = 100,
) -> list[str]:

    cleaned = " ".join(
        text.split()
    )

    if not cleaned:
        return []

    chunks = []

    start = 0

    while start < len(cleaned):

        end = start + chunk_size

        chunk = cleaned[
            start:end
        ].strip()

        if chunk:
            chunks.append(chunk)

        if end >= len(cleaned):
            break

        start = end - overlap

    return chunks