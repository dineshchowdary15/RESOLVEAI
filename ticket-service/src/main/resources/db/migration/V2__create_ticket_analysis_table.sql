CREATE TABLE ticket_analyses (

    id BIGSERIAL PRIMARY KEY,

    ticket_id BIGINT NOT NULL,

    category VARCHAR(100) NOT NULL,

    predicted_priority VARCHAR(30) NOT NULL,

    summary TEXT NOT NULL,

    possible_causes TEXT NOT NULL,

    recommended_actions TEXT NOT NULL,

    confidence DOUBLE PRECISION NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ticket_analysis_ticket
        FOREIGN KEY (ticket_id)
        REFERENCES tickets(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_ticket_analyses_ticket_id
    ON ticket_analyses(ticket_id);

CREATE INDEX idx_ticket_analyses_created_at
    ON ticket_analyses(created_at);