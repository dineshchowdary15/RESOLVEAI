package com.resolveai.ticketservice.client;

import com.resolveai.ticketservice.dto.AiAnalysisRequest;
import com.resolveai.ticketservice.dto.AiAnalysisResponse;
import com.resolveai.ticketservice.exception.AiServiceUnavailableException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class AiServiceClient {

    private final RestClient restClient;

    public AiServiceClient(
            RestClient.Builder restClientBuilder,
            @Value("${ai.service.base-url}") String aiServiceBaseUrl
    ) {

        this.restClient = restClientBuilder
                .baseUrl(aiServiceBaseUrl)
                .build();
    }

    public AiAnalysisResponse analyzeIncident(
            AiAnalysisRequest request
    ) {

        try {

            AiAnalysisResponse response =
                    restClient
                            .post()
                            .uri("/internal/analyze")
                            .body(request)
                            .retrieve()
                            .body(AiAnalysisResponse.class);

            if (response == null) {
                throw new AiServiceUnavailableException(
                        "AI service returned an empty response"
                );
            }

            return response;

        } catch (RestClientException exception) {

            throw new AiServiceUnavailableException(
                    "Unable to communicate with ResolveAI AI service"
            );
        }
    }
}