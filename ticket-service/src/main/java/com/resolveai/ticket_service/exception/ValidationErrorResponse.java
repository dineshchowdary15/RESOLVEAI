package com.resolveai.ticketservice.exception;

import java.time.OffsetDateTime;
import java.util.Map;

public record ValidationErrorResponse(

        OffsetDateTime timestamp,
        int status,
        String error,
        String message,
        Map<String, String> fieldErrors

) {
}