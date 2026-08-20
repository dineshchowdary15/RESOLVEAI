package com.resolveai.ticketservice.exception;

import java.time.OffsetDateTime;

public record ApiErrorResponse(

        OffsetDateTime timestamp,
        int status,
        String error,
        String message

) {
}