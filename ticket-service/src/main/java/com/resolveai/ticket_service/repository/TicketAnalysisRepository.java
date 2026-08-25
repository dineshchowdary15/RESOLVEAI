package com.resolveai.ticketservice.repository;

import com.resolveai.ticketservice.entity.TicketAnalysis;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TicketAnalysisRepository
        extends JpaRepository<TicketAnalysis, Long> {

    Optional<TicketAnalysis>
    findTopByTicketIdOrderByCreatedAtDesc(
            Long ticketId
    );
}