import { ticketService } from "@/services/tickets.service";
import { TicketFilters } from "@/types/tickets";
import { useQuery } from "@tanstack/react-query";

export function useTickets(filters:TicketFilters={}){
    return useQuery({
        queryKey:["tickets",filters],
        queryFn:()=>ticketService.getTickets(filters),
        placeholderData: (previousData)=>previousData
    })
}


export function useTicketById(id: string) {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: () => ticketService.getTicketById(id),
    enabled: Boolean(id),
  });
}
