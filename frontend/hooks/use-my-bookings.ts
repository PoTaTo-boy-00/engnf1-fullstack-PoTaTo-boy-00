import { useQuery } from "@tanstack/react-query";
import { bookingService } from "@/services/booking.service";
import type { BookingStatus } from "@/types/booking";

interface MyBookingsFilters {
  status?: BookingStatus;
  page?: number;
}

export function useMyBookings(filters: MyBookingsFilters) {
  return useQuery({
    queryKey: ["my-bookings", filters],
    queryFn: () => bookingService.getMyBookings(filters),
    placeholderData: (previousData) => previousData,
  });
}