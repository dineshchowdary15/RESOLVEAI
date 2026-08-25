package com.resolveai.ticketservice.controller;

import com.resolveai.ticketservice.dto.AiAnalysisResponse;
import com.resolveai.ticketservice.service.TicketAnalysisService;
import com.resolveai.ticketservice.dto.TicketAnalysisResponse;
import org.springframework.http.ResponseEntity;
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
public TicketAnalysisResponse analyzeTicket(
        @PathVariable Long id
) {

    return ticketAnalysisService
            .analyzeTicket(id);
}
    @GetMapping("/{id}/analysis")
public ResponseEntity<TicketAnalysisResponse> getLatestAnalysis(
        @PathVariable Long id
) {

    TicketAnalysisResponse analysis =
            ticketAnalysisService
                .getLatestAnalysis(id);

    if (analysis == null) {

        return ResponseEntity
                .noContent()
                .build();
    }

    return ResponseEntity.ok(
            analysis
    );
}
}