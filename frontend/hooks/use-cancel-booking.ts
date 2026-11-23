import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "@/services/booking.service";

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingService.cancelBooking(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-bookings"],
      });

      queryClient.invalidateQueries({
        queryKey: ["resource-availability"],
      });
    },
  });
}