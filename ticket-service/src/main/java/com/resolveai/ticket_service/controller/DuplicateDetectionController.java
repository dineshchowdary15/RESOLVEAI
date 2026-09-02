package com.resolveai.ticketservice.controller;

import com.resolveai.ticketservice.dto.DuplicateCheckRequest;
import com.resolveai.ticketservice.dto.DuplicateSearchResponse;
import com.resolveai.ticketservice.service.DuplicateDetectionService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets/duplicates")
public class DuplicateDetectionController {

    private final DuplicateDetectionService
            duplicateDetectionService;

    public DuplicateDetectionController(
            DuplicateDetectionService duplicateDetectionService
    ) {
        this.duplicateDetectionService =
                duplicateDetectionService;
    }

    @PostMapping("/search")
    public ResponseEntity<DuplicateSearchResponse>
    searchDuplicates(
            @Valid
            @RequestBody
            DuplicateCheckRequest request
    ) {

        DuplicateSearchResponse response =
                duplicateDetectionService
                        .findDuplicates(request);

        return ResponseEntity.ok(
                response
        );
    }
}