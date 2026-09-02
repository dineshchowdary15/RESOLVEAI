package com.resolveai.ticketservice.service;

import com.resolveai.ticketservice.client.AiServiceClient;
import com.resolveai.ticketservice.dto.DuplicateCheckRequest;
import com.resolveai.ticketservice.dto.DuplicateSearchRequest;
import com.resolveai.ticketservice.dto.DuplicateSearchResponse;

import org.springframework.stereotype.Service;

@Service
public class DuplicateDetectionService {

    private static final int DEFAULT_TOP_K = 3;

    private final AiServiceClient aiServiceClient;

    public DuplicateDetectionService(
            AiServiceClient aiServiceClient
    ) {
        this.aiServiceClient =
                aiServiceClient;
    }

    public DuplicateSearchResponse findDuplicates(
            DuplicateCheckRequest request
    ) {

        DuplicateSearchRequest aiRequest =
                new DuplicateSearchRequest(
                        request.title(),
                        request.description(),
                        null,
                        DEFAULT_TOP_K
                );

        return aiServiceClient.findDuplicates(
                aiRequest
        );
    }
}