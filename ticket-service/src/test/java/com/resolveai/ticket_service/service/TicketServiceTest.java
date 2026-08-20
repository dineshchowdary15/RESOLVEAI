package com.resolveai.ticketservice.service;

import com.resolveai.ticketservice.dto.CreateTicketRequest;
import com.resolveai.ticketservice.dto.TicketResponse;
import com.resolveai.ticketservice.entity.Ticket;
import com.resolveai.ticketservice.entity.TicketPriority;
import com.resolveai.ticketservice.entity.TicketStatus;
import com.resolveai.ticketservice.repository.TicketRepository;
import com.resolveai.ticketservice.exception.TicketNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private TicketService ticketService;

    private Ticket ticket;

    @BeforeEach
    void setUp() {

        ticket = new Ticket();

        ticket.setId(1L);
        ticket.setTitle("Payment API failure");
        ticket.setDescription(
                "Payment service is returning HTTP 500 errors."
        );
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setPriority(TicketPriority.HIGH);
        ticket.setCreatedAt(OffsetDateTime.now());
        ticket.setUpdatedAt(OffsetDateTime.now());
    }

    @Test
    void createTicket_shouldCreateTicketSuccessfully() {

        CreateTicketRequest request =
                new CreateTicketRequest(
                        "Payment API failure",
                        "Payment service is returning HTTP 500 errors.",
                        TicketPriority.HIGH
                );

        when(ticketRepository.save(any(Ticket.class)))
                .thenReturn(ticket);

        TicketResponse response =
                ticketService.createTicket(request);

        assertNotNull(response);

        assertEquals(
                "Payment API failure",
                response.title()
        );

        assertEquals(
                TicketStatus.OPEN,
                response.status()
        );

        assertEquals(
                TicketPriority.HIGH,
                response.priority()
        );

        verify(ticketRepository, times(1))
                .save(any(Ticket.class));
    }
    @Test
void getTicketById_shouldReturnTicket() {

    when(ticketRepository.findById(1L))
            .thenReturn(Optional.of(ticket));

    TicketResponse response =
            ticketService.getTicketById(1L);

    assertNotNull(response);

    assertEquals(
            1L,
            response.id()
    );

    assertEquals(
            "Payment API failure",
            response.title()
    );

    verify(ticketRepository, times(1))
            .findById(1L);
  }
  @Test
void getTicketById_whenTicketDoesNotExist_shouldThrowException() {

    when(ticketRepository.findById(999L))
            .thenReturn(Optional.empty());

    TicketNotFoundException exception =
            assertThrows(
                    TicketNotFoundException.class,
                    () -> ticketService.getTicketById(999L)
            );

    assertEquals(
            "Ticket with id 999 was not found",
            exception.getMessage()
    );

    verify(ticketRepository, times(1))
            .findById(999L);
}
@Test
void updateStatus_shouldChangeStatusToResolved() {

    when(ticketRepository.findById(1L))
            .thenReturn(Optional.of(ticket));

    ticket.setStatus(TicketStatus.RESOLVED);

    when(ticketRepository.save(any(Ticket.class)))
            .thenReturn(ticket);

    TicketResponse response =
            ticketService.updateStatus(
                    1L,
                    TicketStatus.RESOLVED
            );

    assertEquals(
            TicketStatus.RESOLVED,
            response.status()
    );

    verify(ticketRepository, times(1))
            .findById(1L);

    verify(ticketRepository, times(1))
            .save(ticket);
}
@Test
void deleteTicket_shouldDeleteExistingTicket() {

    when(ticketRepository.findById(1L))
            .thenReturn(Optional.of(ticket));

    ticketService.deleteTicket(1L);

    verify(ticketRepository, times(1))
            .findById(1L);

    verify(ticketRepository, times(1))
            .delete(ticket);
}
}