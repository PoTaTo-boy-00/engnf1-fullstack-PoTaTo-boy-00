import { api } from "@/lib/api";
import type { AdminStats } from "@/types/admin";

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get<AdminStats>("/admin/stats");
    return response.data;
  },
};