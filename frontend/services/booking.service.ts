import { api } from "@/lib/api";
import {
  BookingStatus,
  CreateBookingInput,
  CreateBookingResponse,
  MyBookingsResponse,
} from "@/types/booking";

export const bookingService = {
  async createBooking(input: CreateBookingInput) {
    const response = await api.post<CreateBookingResponse>("/bookings", input);

    return response.data;
  },
  async getMyBookings(params?: { status?: BookingStatus; page?: number }) {
    const response = await api.get<MyBookingsResponse>("/bookings/mine", {
      params,
    });

    return response.data;
  },
  async cancelBooking(id: string) {
  const response = await api.patch(`/bookings/${id}/cancel`);
  return response.data;
}
};
