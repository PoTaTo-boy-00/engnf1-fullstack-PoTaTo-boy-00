
export interface TicketStats {
  byCategory: {
    BILLING: number;
    BUG: number;
    FEATURE_REQUEST: number;
    LOGIN: number;
    DELIVERY: number;
  };

  byPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };

  byStatus: {
    OPEN: number;
    IN_PROGRESS: number;
    RESOLVED: number;
    CLOSED: number;
  };

  reviewedCount: number;
  modelAgreementRate: number;
}
