package com.resolveai.ticketservice.dto;

import com.resolveai.ticketservice.entity.TicketPriority;
import com.resolveai.ticketservice.entity.TicketStatus;

import java.time.OffsetDateTime;

public record TicketResponse(

        Long id,

        String title,

        String description,

        TicketStatus status,

        TicketPriority priority,

        String category,

        OffsetDateTime createdAt,

        OffsetDateTime updatedAt

) {
}