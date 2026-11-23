
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ImportTicketsInput } from "@/types/ticket-import";
import { ticketService } from "@/services/tickets.service";

export function useImportTickets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ImportTicketsInput) =>
      ticketService.importTickets(input),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tickets"] }),
        queryClient.invalidateQueries({ queryKey: ["ticket-stats"] }),
      ]);
    },
  });
}
