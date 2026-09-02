package com.resolveai.ticketservice.client;

import com.resolveai.ticketservice.dto.AiAnalysisRequest;
import com.resolveai.ticketservice.dto.AiAnalysisResponse;
import com.resolveai.ticketservice.dto.DuplicateSearchRequest;
import com.resolveai.ticketservice.dto.DuplicateSearchResponse;
import com.resolveai.ticketservice.dto.TicketIndexRequest;

import com.resolveai.ticketservice.exception.AiServiceUnavailableException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.web.client.RestClientResponseException;
@Component
public class AiServiceClient {
    private static final Logger logger =
        LoggerFactory.getLogger(
                AiServiceClient.class
        );
    private final RestClient restClient;

    public AiServiceClient(
            RestClient.Builder restClientBuilder,
            @Value("${ai.service.base-url}")
            String aiServiceBaseUrl
    ) {

        this.restClient =
                restClientBuilder
                        .baseUrl(aiServiceBaseUrl)
                        .build();
    }


    /*
     * =====================================================
     * AI INCIDENT ANALYSIS
     * =====================================================
     *
     * Spring Boot
     *      ↓
     * FastAPI
     *      ↓
     * RAG + Ollama
     */
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
                            .body(
                                    AiAnalysisResponse.class
                            );

            if (response == null) {

                throw new AiServiceUnavailableException(
                        "AI service returned an empty analysis response"
                );
            }

            return response;

        } catch (RestClientException exception) {

            throw new AiServiceUnavailableException(
                    "Unable to communicate with ResolveAI AI service"
            );
        }
    }


    /*
     * =====================================================
     * SEMANTIC DUPLICATE SEARCH
     * =====================================================
     *
     * Calls:
     *
     * POST /internal/duplicates/search
     *
     * FastAPI:
     * title + description
     *      ↓
     * embedding
     *      ↓
     * pgvector
     *      ↓
     * similar incidents
     */
    public DuplicateSearchResponse findDuplicates(
        DuplicateSearchRequest request
) {

    try {

        DuplicateSearchResponse response =
                restClient
                        .post()
                        .uri(
                                "/internal/duplicates/search"
                        )
                        .body(request)
                        .retrieve()
                        .body(
                                DuplicateSearchResponse.class
                        );

        if (response == null) {

            throw new AiServiceUnavailableException(
                    "AI service returned an empty duplicate-search response"
            );
        }

        return response;

    } catch (
            RestClientResponseException exception
    ) {

        logger.error(
                "Duplicate search FastAPI error. "
                        + "Status: {}, Body: {}",
                exception.getStatusCode(),
                exception.getResponseBodyAsString(),
                exception
        );

        throw new AiServiceUnavailableException(
                "Unable to perform duplicate incident search"
        );

    } catch (RestClientException exception) {

        logger.error(
                "Unable to call FastAPI duplicate endpoint",
                exception
        );

        throw new AiServiceUnavailableException(
                "Unable to perform duplicate incident search"
        );
    }
}


    /*
     * =====================================================
     * TICKET EMBEDDING INDEX
     * =====================================================
     *
     * Called after a new ticket is created.
     *
     * Spring Boot creates ticket
     *      ↓
     * FastAPI generates embedding
     *      ↓
     * ticket_embeddings
     *
     * FastAPI returns:
     *
     * 204 No Content
     */
    public void indexTicket(
            TicketIndexRequest request
    ) {

        try {

            restClient
                    .post()
                    .uri(
                            "/internal/duplicates/index"
                    )
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();

        } catch (RestClientException exception) {

            /*
             * Indexing should not pretend that
             * ticket creation succeeded if the
             * AI service call itself failed.
             *
             * We will decide in the service layer
             * whether this failure should block
             * ticket creation or only be logged.
             */
            throw new AiServiceUnavailableException(
                    "Unable to index incident for duplicate detection"
            );
        }
    }
}