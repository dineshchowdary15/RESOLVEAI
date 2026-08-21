import axios from "axios";

import type {
  CreateTicketRequest,
  Ticket,
  TicketStatus,
} from "../types/ticket";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getTickets(): Promise<Ticket[]> {
  const response = await api.get<Ticket[]>("/tickets");

  return response.data;
}

export async function getTicketById(
  id: number
): Promise<Ticket> {
  const response = await api.get<Ticket>(
    `/tickets/${id}`
  );

  return response.data;
}

export async function createTicket(
  request: CreateTicketRequest
): Promise<Ticket> {
  const response = await api.post<Ticket>(
    "/tickets",
    request
  );

  return response.data;
}

export async function updateTicketStatus(
  id: number,
  status: TicketStatus
): Promise<Ticket> {
  const response = await api.patch<Ticket>(
    `/tickets/${id}/status`,
    {
      status,
    }
  );

  return response.data;
}

export async function deleteTicket(
  id: number
): Promise<void> {
  await api.delete(`/tickets/${id}`);
}