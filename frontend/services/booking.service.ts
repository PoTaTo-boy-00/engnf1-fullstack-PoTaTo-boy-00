import { api } from "@/lib/api";
import {
  
    AdminBookingFilters,
  AdminBookingsResponse,
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
  },
 async getAllBookings(params: AdminBookingFilters = {}) {
  const response = await api.get<AdminBookingsResponse>(
    "/bookings",
    { params }
  );

  return response.data;
},
  async approveBooking(id: string) {
    const response = await api.patch(`/bookings/${id}/approve`);
    return response.data;
  },

  async rejectBooking(id: string, note: string) {
    const response = await api.patch(`/bookings/${id}/reject`, {
      note,
    });

    return response.data;
  },
};
