import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { bookingService } from "@/services/booking.service";
import type {
  AdminBookingFilters,
} from "@/types/booking";

export function useAdminBookings(filters: AdminBookingFilters = {}) {
  return useQuery({
    queryKey: ["admin", "bookings", filters],
    queryFn: () => bookingService.getAllBookings(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useApproveBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      bookingService.approveBooking(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useRejectBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      bookingService.rejectBooking(id, note),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}