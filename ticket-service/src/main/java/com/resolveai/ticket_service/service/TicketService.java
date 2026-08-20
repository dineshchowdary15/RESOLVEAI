package com.resolveai.ticketservice.service;

import com.resolveai.ticketservice.dto.CreateTicketRequest;
import com.resolveai.ticketservice.dto.TicketResponse;
import com.resolveai.ticketservice.entity.Ticket;
import com.resolveai.ticketservice.entity.TicketPriority;
import com.resolveai.ticketservice.entity.TicketStatus;
import com.resolveai.ticketservice.exception.TicketNotFoundException;
import com.resolveai.ticketservice.repository.TicketRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public TicketResponse createTicket(CreateTicketRequest request) {

        Ticket ticket = new Ticket();

        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setStatus(TicketStatus.OPEN);

        ticket.setPriority(
                request.priority() == null
                        ? TicketPriority.MEDIUM
                        : request.priority()
        );

        Ticket savedTicket = ticketRepository.save(ticket);

        return mapToResponse(savedTicket);
    }

    public List<TicketResponse> getAllTickets() {

        return ticketRepository
                .findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public TicketResponse getTicketById(Long id) {

        Ticket ticket = findTicket(id);

        return mapToResponse(ticket);
    }

    public TicketResponse updateStatus(Long id, TicketStatus status) {

        Ticket ticket = findTicket(id);

        ticket.setStatus(status);

        Ticket updatedTicket = ticketRepository.save(ticket);

        return mapToResponse(updatedTicket);
    }

    public void deleteTicket(Long id) {

        Ticket ticket = findTicket(id);

        ticketRepository.delete(ticket);
    }

    private Ticket findTicket(Long id) {

        return ticketRepository
                .findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));
    }

    private TicketResponse mapToResponse(Ticket ticket) {

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