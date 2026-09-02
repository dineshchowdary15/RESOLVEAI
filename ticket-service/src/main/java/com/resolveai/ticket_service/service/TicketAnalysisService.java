package com.resolveai.ticketservice.service;

import com.resolveai.ticketservice.client.AiServiceClient;
import com.resolveai.ticketservice.dto.AiAnalysisRequest;
import com.resolveai.ticketservice.dto.AiAnalysisResponse;
import com.resolveai.ticketservice.dto.KnowledgeSourceResponse;
import com.resolveai.ticketservice.dto.TicketAnalysisResponse;
import com.resolveai.ticketservice.dto.TicketResponse;
import com.resolveai.ticketservice.entity.TicketAnalysis;
import com.resolveai.ticketservice.repository.TicketAnalysisRepository;

import org.springframework.stereotype.Service;

import tools.jackson.core.JacksonException;
import tools.jackson.core.JsonParser;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@Service
public class TicketAnalysisService {

    private final TicketService ticketService;
    private final AiServiceClient aiServiceClient;
    private final TicketAnalysisRepository ticketAnalysisRepository;
    private final ObjectMapper objectMapper;

    public TicketAnalysisService(
            TicketService ticketService,
            AiServiceClient aiServiceClient,
            TicketAnalysisRepository ticketAnalysisRepository,
            ObjectMapper objectMapper
    ) {
        this.ticketService = ticketService;
        this.aiServiceClient = aiServiceClient;
        this.ticketAnalysisRepository = ticketAnalysisRepository;
        this.objectMapper = objectMapper;
    }

    public TicketAnalysisResponse getLatestAnalysis(
            Long ticketId
    ) {

        // Verify ticket exists first
        ticketService.getTicketById(ticketId);

        return ticketAnalysisRepository
                .findTopByTicketIdOrderByCreatedAtDesc(ticketId)
                .map(this::mapToResponse)
                .orElse(null);
    }

    public TicketAnalysisResponse analyzeTicket(
            Long ticketId
    ) {

        TicketResponse ticket =
                ticketService.getTicketById(ticketId);

        AiAnalysisRequest request =
                new AiAnalysisRequest(
                        ticket.id(),
                        ticket.title(),
                        ticket.description()
                );

        AiAnalysisResponse aiResponse =
                aiServiceClient.analyzeIncident(request);

        try {

            TicketAnalysis analysis =
                    new TicketAnalysis();

            analysis.setTicketId(ticketId);

            analysis.setCategory(
                    aiResponse.category()
            );

            analysis.setPredictedPriority(
                    aiResponse.predictedPriority()
            );

            analysis.setSummary(
                    aiResponse.summary()
            );

            analysis.setPossibleCauses(
                    objectMapper.writeValueAsString(
                            aiResponse.possibleCauses()
                    )
            );

            analysis.setRecommendedActions(
                    objectMapper.writeValueAsString(
                            aiResponse.recommendedActions()
                    )
            );

            List<KnowledgeSourceResponse> knowledgeSources =
                    aiResponse.knowledgeSources() == null
                            ? List.of()
                            : aiResponse.knowledgeSources();

            analysis.setKnowledgeSources(
                    objectMapper.writeValueAsString(
                            knowledgeSources
                    )
            );

            analysis.setConfidence(
                    aiResponse.confidence()
            );

            TicketAnalysis saved =
                    ticketAnalysisRepository.save(
                            analysis
                    );

            return mapToResponse(saved);

        } catch (JacksonException exception) {

            throw new IllegalStateException(
                    "Unable to serialize AI analysis",
                    exception
            );
        }
    }

    private TicketAnalysisResponse mapToResponse(
            TicketAnalysis analysis
    ) {

        try {

            List<String> causes =
                    readJson(
                            analysis.getPossibleCauses(),
                            new TypeReference<List<String>>() {
                            }
                    );

            List<String> actions =
                    readJson(
                            analysis.getRecommendedActions(),
                            new TypeReference<List<String>>() {
                            }
                    );

            List<KnowledgeSourceResponse> sources =
                    readJson(
                            analysis.getKnowledgeSources(),
                            new TypeReference<
                                    List<KnowledgeSourceResponse>
                                    >() {
                            }
                    );

            return new TicketAnalysisResponse(
                    analysis.getId(),
                    analysis.getTicketId(),
                    analysis.getCategory(),
                    analysis.getPredictedPriority(),
                    analysis.getSummary(),
                    causes,
                    actions,
                    analysis.getConfidence(),
                    sources,
                    analysis.getCreatedAt()
            );

        } catch (JacksonException exception) {

            throw new IllegalStateException(
                    "Unable to deserialize AI analysis",
                    exception
            );
        }
    }

    private <T> T readJson(
            String json,
            TypeReference<T> typeReference
    ) throws JacksonException {

        if (json == null || json.isBlank()) {
            json = "[]";
        }

        try (
                JsonParser parser =
                        objectMapper.createParser(json)
        ) {

            return objectMapper.readValue(
                    parser,
                    typeReference
            );
        }
    }
}