
import {api} from "@/lib/api";
import type {
  ResourceFilters,
  ResourceListResponse,
  Resource,
  ResourceAvailability,
  CreateResourceInput,
  UpdateResourceInput,
} from "@/types/resource";

export const resourceService = {
  getResources: async (
    filters: ResourceFilters = {}
  ): Promise<ResourceListResponse> => {
    const response = await api.get<ResourceListResponse>(
      "/resources",
      { params: filters }
    );

    return response.data;
  },

  getResourceById: async (id: string): Promise<Resource> => {
    const response = await api.get<Resource>(`/resources/${id}`);
    return response.data;
  },

getAvailability: async (
  id: string,
  from: string,
  to: string
): Promise<ResourceAvailability> => {
  const response = await api.get<ResourceAvailability>(
    `/resources/${id}/availability`,
    {
      params: { from, to },
    }
  );

  return response.data;
},
createResource: async (data: CreateResourceInput): Promise<Resource> => {
  const response = await api.post<Resource>("/resources", data);
  return response.data;
},

updateResource: async (
  id: string,
  data: UpdateResourceInput
): Promise<Resource> => {
  const response = await api.patch<Resource>(`/resources/${id}`, data);
  return response.data;
},

};
