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