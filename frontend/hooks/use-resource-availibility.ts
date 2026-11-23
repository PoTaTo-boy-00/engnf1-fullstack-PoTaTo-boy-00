
import { useQuery } from "@tanstack/react-query";
import { resourceService } from "@/services/resource.service";

export function useResourceAvailability(
  id: string,
  from: string,
  to: string
) {
  return useQuery({
    queryKey: ["resource-availability", id, from, to],
    queryFn: () => resourceService.getAvailability(id, from, to),
    enabled: Boolean(id && from && to),
  });
}
