
import { ticketService } from "@/services/tickets.service";
import { useQuery } from "@tanstack/react-query";

export function useTicketStats() {
  return useQuery({
    queryKey: ["ticket-stats"],
    queryFn: ticketService.getStats,
  });
}
