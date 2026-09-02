export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export type TicketPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}

export interface KnowledgeSource {
  documentTitle: string;
  similarity: number;
}

export interface TicketAnalysis {
  id: number;
  ticketId: number;
  category: string;
  predictedPriority: string;
  summary: string;
  possibleCauses: string[];
  recommendedActions: string[];
  confidence: number;
  knowledgeSources: KnowledgeSource[];
  createdAt: string;
}
export interface DuplicateCheckRequest {
  title: string;
  description: string;
}

export interface DuplicateIncident {
  ticketId: number;
  title: string;
  description: string;
  similarity: number;
}

export interface DuplicateSearchResponse {
  potentialDuplicate: boolean;
  threshold: number;
  results: DuplicateIncident[];
}