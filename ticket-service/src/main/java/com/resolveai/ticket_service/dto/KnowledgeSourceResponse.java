package com.resolveai.ticketservice.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public record KnowledgeSourceResponse(

        @JsonAlias("document_title")
        String documentTitle,

        double similarity

) {
}