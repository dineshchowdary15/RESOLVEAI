package com.resolveai.ticketservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DuplicateSearchRequest(

        @JsonProperty("title")
        String title,

        @JsonProperty("description")
        String description,

        @JsonProperty("exclude_ticket_id")
        Long excludeTicketId,

        @JsonProperty("top_k")
        Integer topK

) {
}