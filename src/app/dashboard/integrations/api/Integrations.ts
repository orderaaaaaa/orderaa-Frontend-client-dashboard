import http from '@/lib/api/http';
import {
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
  UpdateStoreRequest,
  IntegrationResponse,
  StoreResponse,
} from '../types/apiIntegration';

export const storeApi = {
  create: async (data: { name: string; description?: string }): Promise<StoreResponse> => {
    const response = await http.post<StoreResponse>('/stores', data);
    return response.data;
  },

  update: async (id: number, data: UpdateStoreRequest): Promise<StoreResponse> => {
    const response = await http.put<StoreResponse>(`/stores/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`/stores/${id}`);
  },
};

export const integrationApi = {
  getAll: async (): Promise<IntegrationResponse[]> => {
    const response = await http.get<IntegrationResponse[]>('/integration-configs');
    return response.data;
  },

  getById: async (configId: number): Promise<IntegrationResponse> => {
    const response = await http.get<IntegrationResponse>(
      `/integration-configs/${configId}`
    );
    return response.data;
  },

  create: async (data: CreateIntegrationRequest): Promise<IntegrationResponse> => {
    const response = await http.post<IntegrationResponse>(
      '/integration-configs',
      data
    );
    return response.data;
  },

  update: async (configId: number, data: UpdateIntegrationRequest): Promise<IntegrationResponse> => {
    const response = await http.put<IntegrationResponse>(
      `/integration-configs/${configId}`,
      data
    );
    return response.data;
  },

  delete: async (configId: number): Promise<void> => {
    await http.delete(`/integration-configs/${configId}`);
  },
};
