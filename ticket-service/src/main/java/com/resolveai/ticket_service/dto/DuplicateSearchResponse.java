package com.resolveai.ticketservice.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

import java.util.List;

public record DuplicateSearchResponse(

        @JsonAlias("potential_duplicate")
        boolean potentialDuplicate,

        double threshold,

        List<DuplicateIncidentResponse> results

) {
}