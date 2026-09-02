CREATE EXTENSION IF NOT EXISTS vector;


CREATE TABLE knowledge_documents (

    id BIGSERIAL PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    source VARCHAR(500),

    created_at TIMESTAMP WITH TIME ZONE
        NOT NULL DEFAULT CURRENT_TIMESTAMP

);


CREATE TABLE knowledge_chunks (

    id BIGSERIAL PRIMARY KEY,

    document_id BIGINT NOT NULL,

    chunk_index INTEGER NOT NULL,

    content TEXT NOT NULL,

    embedding VECTOR(768) NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_knowledge_chunk_document
        FOREIGN KEY (document_id)
        REFERENCES knowledge_documents(id)
        ON DELETE CASCADE

);


CREATE INDEX idx_knowledge_chunks_document_id
    ON knowledge_chunks(document_id);


CREATE INDEX idx_knowledge_chunks_embedding
    ON knowledge_chunks
    USING hnsw (embedding vector_cosine_ops);