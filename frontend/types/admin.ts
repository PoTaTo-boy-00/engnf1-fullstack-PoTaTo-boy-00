export interface AdminStats {
  activeResources: number;

  bookingsByStatus: {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    CANCELLED: number;
  };

  topResources: {
    id: string;
    name: string;
    type: "ROOM" | "LAB" | "EQUIPMENT";
    bookingCount: number;
  }[];

  ticketStats: {
    totalTickets: number;
  };
}