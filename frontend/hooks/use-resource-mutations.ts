import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resourceService } from "@/services/resource.service";
import type {
  CreateResourceInput,
  UpdateResourceInput,
} from "@/types/resource";

export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResourceInput) =>
      resourceService.createResource(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateResourceInput;
    }) => resourceService.updateResource(id, data),

    onSuccess: (resource) => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.setQueryData(["resources", resource.id], resource);
    },
  });
}