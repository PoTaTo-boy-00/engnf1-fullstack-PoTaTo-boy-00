
import { useQuery } from "@tanstack/react-query";
import { resourceService } from "@/services/resource.service";
import type { ResourceFilters } from "@/types/resource";

export function useResources(filters: ResourceFilters = {}) {
  return useQuery({
    queryKey: ["resources", filters],
    queryFn: () => resourceService.getResources(filters),
    placeholderData: (previousData) => previousData,
  });
}
export function useResourceById(id:string) {
  return useQuery({
    queryKey: ["resources", id],
    queryFn: () => resourceService.getResourceById(id),
    // placeholderData: (previousData) => previousData,
    enabled: Boolean(id),
  });
}
