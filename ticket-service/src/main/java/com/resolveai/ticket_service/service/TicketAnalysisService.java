package com.resolveai.ticketservice.service;

import com.resolveai.ticketservice.client.AiServiceClient;
import com.resolveai.ticketservice.dto.AiAnalysisRequest;
import com.resolveai.ticketservice.dto.AiAnalysisResponse;
import com.resolveai.ticketservice.dto.TicketResponse;

import org.springframework.stereotype.Service;

@Service
public class TicketAnalysisService {

    private final TicketService ticketService;
    private final AiServiceClient aiServiceClient;

    public TicketAnalysisService(
            TicketService ticketService,
            AiServiceClient aiServiceClient
    ) {

        this.ticketService = ticketService;
        this.aiServiceClient = aiServiceClient;
    }

    public AiAnalysisResponse analyzeTicket(Long ticketId) {

        TicketResponse ticket =
                ticketService.getTicketById(ticketId);

        AiAnalysisRequest request =
                new AiAnalysisRequest(
                        ticket.id(),
                        ticket.title(),
                        ticket.description()
                );

        return aiServiceClient
                .analyzeIncident(request);
    }
}