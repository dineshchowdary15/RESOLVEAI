package com.resolveai.ticketservice.dto;

import jakarta.validation.constraints.NotBlank;

public record DuplicateCheckRequest(

        @NotBlank(message = "Title is required")
        String title,

        @NotBlank(message = "Description is required")
        String description

) {
}