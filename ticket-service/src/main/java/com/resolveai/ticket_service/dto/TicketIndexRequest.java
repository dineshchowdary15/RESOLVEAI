package com.resolveai.ticketservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TicketIndexRequest(

        @JsonProperty("ticket_id")
        Long ticketId,

        String title,

        String description

) {
}