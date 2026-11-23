
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Ticket } from "@/types/tickets";
import { ticketService } from "@/services/tickets.service";

export function useUpdateTicket(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      category?: Ticket["category"];
      priority?: Ticket["priority"];
      status?: Ticket["status"];
    }) => ticketService.updateTicket(id, input),

    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: ["ticket", id],
      });

      const previousTicket = queryClient.getQueryData<Ticket>([
        "ticket",
        id,
      ]);

      if (previousTicket) {
        queryClient.setQueryData<Ticket>(["ticket", id], {
          ...previousTicket,
          ...input,
          isHumanOverride:
            input.category !== undefined
              ? true
              : previousTicket.isHumanOverride,
          isReviewed: true,
        });
      }

      return { previousTicket };
    },

    onError: (_error, _input, context) => {
      if (context?.previousTicket) {
        queryClient.setQueryData(
          ["ticket", id],
          context.previousTicket
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["ticket", id],
      });

      queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });
    },
  });
}
