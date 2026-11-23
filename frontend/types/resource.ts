
export type ResourceType = "ROOM" | "LAB" | "EQUIPMENT";

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  capacity: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ResourceFilters {
  search?: string;
  type?: ResourceType;
  minCapacity?: number;
  page?: number;
  limit?: number;
}

export interface ResourceListResponse {
  data: Resource[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}


export interface ResourceBooking {
  id: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "APPROVED";
}

export interface ResourceAvailability {
  resourceId: string;
  from: string;
  to: string;
  bookings: ResourceBooking[];
}

export interface CreateResourceInput {
  name: string;
  type: ResourceType;
  capacity: number;
  description?: string | null;
}

export interface UpdateResourceInput {
  name?: string;
  type?: ResourceType;
  capacity?: number;
  description?: string | null;
  isActive?: boolean;
}