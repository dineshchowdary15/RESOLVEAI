package com.resolveai.ticketservice.dto;

import com.resolveai.ticketservice.entity.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateTicketStatusRequest(

        @NotNull(message = "Status is required")
        TicketStatus status

) {
}