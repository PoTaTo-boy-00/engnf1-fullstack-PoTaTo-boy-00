import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "@/services/booking.service";

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingService.createBooking,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["resource-availability"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-bookings"],
      });
    },
  });
}