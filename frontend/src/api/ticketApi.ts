import axios from "axios";

import type {
  CreateTicketRequest,
  DuplicateCheckRequest,
  DuplicateSearchResponse,
  Ticket,
  TicketAnalysis,
  TicketStatus,
} from "../types/ticket";


const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});


/*
 * =====================================================
 * GET ALL INCIDENTS
 * =====================================================
 */
export async function getTickets(): Promise<
  Ticket[]
> {

  const response =
    await api.get<Ticket[]>(
      "/tickets"
    );

  return response.data;
}


/*
 * =====================================================
 * GET ONE INCIDENT
 * =====================================================
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
 * =====================================================
 * CREATE INCIDENT
 * =====================================================
 *
 * Spring Boot automatically indexes
 * the new incident for future semantic
 * duplicate detection.
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
 * =====================================================
 * SEMANTIC DUPLICATE SEARCH
 * =====================================================
 *
 * React
 *   ↓
 * Spring Boot
 *   ↓
 * FastAPI
 *   ↓
 * Ollama embeddings
 *   ↓
 * pgvector
 */
export async function checkTicketDuplicates(
  request: DuplicateCheckRequest
): Promise<DuplicateSearchResponse> {

  const response =
    await api.post<
      DuplicateSearchResponse
    >(
      "/tickets/duplicates/search",
      request
    );

  return response.data;
}


/*
 * =====================================================
 * UPDATE INCIDENT STATUS
 * =====================================================
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
 * =====================================================
 * DELETE INCIDENT
 * =====================================================
 */
export async function deleteTicket(
  id: number
): Promise<void> {

  await api.delete(
    `/tickets/${id}`
  );
}


/*
 * =====================================================
 * RUN AI ANALYSIS
 * =====================================================
 *
 * React
 *   ↓
 * Spring Boot
 *   ↓
 * FastAPI
 *   ↓
 * RAG
 *   ↓
 * Ollama
 *   ↓
 * PostgreSQL
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
 * =====================================================
 * GET SAVED AI ANALYSIS
 * =====================================================
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