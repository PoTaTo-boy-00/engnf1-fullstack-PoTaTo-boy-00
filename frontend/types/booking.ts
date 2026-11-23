
export interface CreateBookingInput {
  resourceId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  ticketId?: string;
}

export interface CreateBookingResponse {
  message: string;
  booking: {
    id: string;
    status: string;
  };
}
export type BookingStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  ticketId: string | null;
  startTime: string;
  endTime: string;
  purpose: string;
  status: BookingStatus;
  decisionNote: string | null;
  createdAt: string;
  resource: {
    id: string;
    name: string;
    type: "ROOM" | "LAB" | "EQUIPMENT";
  };
}

export interface MyBookingsResponse {
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}