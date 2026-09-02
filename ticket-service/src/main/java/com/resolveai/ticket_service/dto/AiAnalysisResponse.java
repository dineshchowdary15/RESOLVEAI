package com.resolveai.ticketservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AiAnalysisResponse(

        @JsonProperty("ticket_id")
        Long ticketId,

        String category,

        @JsonProperty("predicted_priority")
        String predictedPriority,

        String summary,

        @JsonProperty("possible_causes")
        List<String> possibleCauses,

        @JsonProperty("recommended_actions")
        List<String> recommendedActions,

        double confidence,

        @JsonProperty("knowledge_sources")
        List<KnowledgeSourceResponse> knowledgeSources

) {
}