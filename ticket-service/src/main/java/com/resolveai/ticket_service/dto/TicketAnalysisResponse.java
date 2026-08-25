package com.resolveai.ticketservice.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record TicketAnalysisResponse(

        Long id,

        Long ticketId,

        String category,

        String predictedPriority,

        String summary,

        List<String> possibleCauses,

        List<String> recommendedActions,

        double confidence,

        OffsetDateTime createdAt

) {
}