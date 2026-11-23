import { api } from "@/lib/api";
import { TicketStats } from "@/types/stats";
import { ImportTicketsInput, ImportTicketsResult } from "@/types/ticket-import";
import type {
  Ticket,
  TicketCategory,
  TicketFilters,
  TicketListResponse,
  TicketPriority,
  TicketStatus,
} from "@/types/tickets";

export const ticketService = {
  getTickets: async (
    filters: TicketFilters = {},
  ): Promise<TicketListResponse> => {
    const response = await api.get<TicketListResponse>("/tickets", {
      params: filters,
    });

    return response.data;
  },

  getTicketById: async (id: string): Promise<Ticket> => {
    const response = await api.get<Ticket>(`/tickets/${id}`);
    return response.data;
  },
  updateTicket: async (
    id: string,
    input: {
      category?: TicketCategory;
      priority?: TicketPriority;
      status?: TicketStatus;
    },
  ): Promise<Ticket> => {
    const response = await api.patch<Ticket>(`/tickets/${id}`, input);

    return response.data;
  },

  getStats: async (): Promise<TicketStats> => {
    const response = await api.get<TicketStats>("/stats");
    return response.data;
  },

importTickets: async (
  input: ImportTicketsInput
): Promise<ImportTicketsResult> => {
  const response = await api.post<ImportTicketsResult>(
    "/tickets/import",
    input
  );

  return response.data;
},

};
