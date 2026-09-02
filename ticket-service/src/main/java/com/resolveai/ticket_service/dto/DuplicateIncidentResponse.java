package com.resolveai.ticketservice.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public record DuplicateIncidentResponse(

        @JsonAlias("ticket_id")
        Long ticketId,

        String title,

        String description,

        double similarity

) {
}