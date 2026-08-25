import axios from "axios";

import type {
  CreateTicketRequest,
  Ticket,
  TicketAnalysis,
  TicketStatus,
} from "../types/ticket";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/*
 * Get all incidents
 */
export async function getTickets(): Promise<Ticket[]> {
  const response =
    await api.get<Ticket[]>("/tickets");

  return response.data;
}

/*
 * Get one incident
 */
export async function getTicketById(
  id: number
): Promise<Ticket> {
  const response =
    await api.get<Ticket>(
      `/tickets/${id}`
    );

  return response.data;
}

/*
 * Create a new incident
 */
export async function createTicket(
  request: CreateTicketRequest
): Promise<Ticket> {
  const response =
    await api.post<Ticket>(
      "/tickets",
      request
    );

  return response.data;
}

/*
 * Update incident lifecycle status
 */
export async function updateTicketStatus(
  id: number,
  status: TicketStatus
): Promise<Ticket> {
  const response =
    await api.patch<Ticket>(
      `/tickets/${id}/status`,
      {
        status,
      }
    );

  return response.data;
}

/*
 * Delete incident
 */
export async function deleteTicket(
  id: number
): Promise<void> {
  await api.delete(
    `/tickets/${id}`
  );
}

/*
 * Run a NEW AI analysis.
 *
 * Backend flow:
 *
 * React
 *   ↓
 * Spring Boot
 *   ↓
 * FastAPI
 *   ↓
 * Ollama
 *   ↓
 * PostgreSQL
 *
 * The backend saves the analysis
 * before returning it.
 */
export async function analyzeTicket(
  id: number
): Promise<TicketAnalysis> {
  const response =
    await api.post<TicketAnalysis>(
      `/tickets/${id}/analyze`
    );

  return response.data;
}

/*
 * Load the latest previously-saved
 * AI analysis from PostgreSQL.
 *
 * This does NOT run Ollama again.
 */
export async function getTicketAnalysis(
  id: number
): Promise<TicketAnalysis | null> {
  const response =
    await api.get<TicketAnalysis>(
      `/tickets/${id}/analysis`
    );

  if (response.status === 204) {
    return null;
  }

  return response.data;
}