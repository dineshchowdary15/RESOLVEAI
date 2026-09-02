package com.resolveai.ticketservice.service;

import com.resolveai.ticketservice.client.AiServiceClient;

import com.resolveai.ticketservice.dto.CreateTicketRequest;
import com.resolveai.ticketservice.dto.TicketIndexRequest;
import com.resolveai.ticketservice.dto.TicketResponse;

import com.resolveai.ticketservice.entity.Ticket;
import com.resolveai.ticketservice.entity.TicketPriority;
import com.resolveai.ticketservice.entity.TicketStatus;

import com.resolveai.ticketservice.exception.AiServiceUnavailableException;
import com.resolveai.ticketservice.exception.TicketNotFoundException;

import com.resolveai.ticketservice.repository.TicketRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class TicketService {

    private static final Logger logger =
            LoggerFactory.getLogger(
                    TicketService.class
            );

    private final TicketRepository ticketRepository;

    private final AiServiceClient aiServiceClient;


    public TicketService(
            TicketRepository ticketRepository,
            AiServiceClient aiServiceClient
    ) {

        this.ticketRepository =
                ticketRepository;

        this.aiServiceClient =
                aiServiceClient;
    }


    /*
     * =====================================================
     * CREATE TICKET
     * =====================================================
     *
     * Flow:
     *
     * React
     *   ↓
     * Spring Boot
     *   ↓
     * PostgreSQL tickets table
     *   ↓
     * FastAPI duplicate index endpoint
     *   ↓
     * Ollama embedding
     *   ↓
     * pgvector ticket_embeddings
     */
    public TicketResponse createTicket(
            CreateTicketRequest request
    ) {

        Ticket ticket =
                new Ticket();

        ticket.setTitle(
                request.title()
        );

        ticket.setDescription(
                request.description()
        );

        ticket.setStatus(
                TicketStatus.OPEN
        );

        ticket.setPriority(
                request.priority() == null
                        ? TicketPriority.MEDIUM
                        : request.priority()
        );


        /*
         * First save the ticket.
         *
         * We need the generated database ID
         * before creating the embedding.
         */
        Ticket savedTicket =
                ticketRepository.save(
                        ticket
                );


        /*
         * Automatically create/update the
         * semantic embedding for this ticket.
         */
        indexTicketForDuplicateDetection(
                savedTicket
        );


        return mapToResponse(
                savedTicket
        );
    }


    /*
     * =====================================================
     * GET ALL TICKETS
     * =====================================================
     */
    public List<TicketResponse> getAllTickets() {

        return ticketRepository
                .findAll(
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                )
                .stream()
                .map(
                        this::mapToResponse
                )
                .toList();
    }


    /*
     * =====================================================
     * GET TICKET BY ID
     * =====================================================
     */
    public TicketResponse getTicketById(
            Long id
    ) {

        Ticket ticket =
                findTicket(id);

        return mapToResponse(
                ticket
        );
    }


    /*
     * =====================================================
     * UPDATE STATUS
     * =====================================================
     */
    public TicketResponse updateStatus(
            Long id,
            TicketStatus status
    ) {

        Ticket ticket =
                findTicket(id);

        ticket.setStatus(
                status
        );

        Ticket updatedTicket =
                ticketRepository.save(
                        ticket
                );

        return mapToResponse(
                updatedTicket
        );
    }


    /*
     * =====================================================
     * DELETE TICKET
     * =====================================================
     *
     * ticket_embeddings uses:
     *
     * ON DELETE CASCADE
     *
     * so deleting the ticket automatically
     * deletes its embedding.
     */
    public void deleteTicket(
            Long id
    ) {

        Ticket ticket =
                findTicket(id);

        ticketRepository.delete(
                ticket
        );
    }


    /*
     * =====================================================
     * SEMANTIC EMBEDDING INDEX
     * =====================================================
     *
     * Indexing is intentionally best-effort.
     *
     * If Ollama/FastAPI is temporarily down,
     * the ticket is still successfully created.
     */
    private void indexTicketForDuplicateDetection(
            Ticket ticket
    ) {

        try {

            TicketIndexRequest indexRequest =
                    new TicketIndexRequest(
                            ticket.getId(),
                            ticket.getTitle(),
                            ticket.getDescription()
                    );

            aiServiceClient.indexTicket(
                    indexRequest
            );

            logger.info(
                    "Indexed ticket {} for semantic duplicate detection",
                    ticket.getId()
            );

        } catch (
                AiServiceUnavailableException exception
        ) {

            logger.warn(
                    "Ticket {} was created, "
                            + "but semantic indexing failed. "
                            + "Duplicate detection may not include "
                            + "this ticket until it is reindexed.",
                    ticket.getId(),
                    exception
            );
        }
    }


    /*
     * =====================================================
     * FIND ENTITY
     * =====================================================
     */
    private Ticket findTicket(
            Long id
    ) {

        return ticketRepository
                .findById(id)
                .orElseThrow(
                        () ->
                                new TicketNotFoundException(
                                        id
                                )
                );
    }


    /*
     * =====================================================
     * ENTITY → API RESPONSE
     * =====================================================
     */
    private TicketResponse mapToResponse(
            Ticket ticket
    ) {

        return new TicketResponse(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getStatus(),
                ticket.getPriority(),
                ticket.getCategory(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }
}