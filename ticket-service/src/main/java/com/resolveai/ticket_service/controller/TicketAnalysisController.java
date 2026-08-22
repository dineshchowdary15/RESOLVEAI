package com.resolveai.ticketservice.controller;

import com.resolveai.ticketservice.dto.AiAnalysisResponse;
import com.resolveai.ticketservice.service.TicketAnalysisService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
public class TicketAnalysisController {

    private final TicketAnalysisService ticketAnalysisService;

    public TicketAnalysisController(
            TicketAnalysisService ticketAnalysisService
    ) {

        this.ticketAnalysisService =
                ticketAnalysisService;
    }

    @PostMapping("/{id}/analyze")
    public AiAnalysisResponse analyzeTicket(
            @PathVariable Long id
    ) {

        return ticketAnalysisService
                .analyzeTicket(id);
    }
}