CREATE TABLE ticket_embeddings (

    ticket_id BIGINT PRIMARY KEY,

    content TEXT NOT NULL,

    embedding VECTOR(768) NOT NULL,

    updated_at TIMESTAMP WITH TIME ZONE
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ticket_embedding_ticket
        FOREIGN KEY (ticket_id)
        REFERENCES tickets(id)
        ON DELETE CASCADE
);


CREATE INDEX idx_ticket_embeddings_vector
    ON ticket_embeddings
    USING hnsw (embedding vector_cosine_ops);