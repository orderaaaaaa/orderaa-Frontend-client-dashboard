import http from '@/lib/api/http';
import {
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
  IntegrationResponse,
  StoreResponse,
} from '../types/apiIntegration';

export const storeApi = {
  create: async (data: { name: string; description?: string }): Promise<StoreResponse> => {
    const response = await http.post<StoreResponse>('/stores', data);
    return response.data;
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

  testWebhook: async (provider: string, storeId: number): Promise<unknown> => {
    const response = await http.get(`/webhook/orders/${provider.toLowerCase()}/${storeId}`);
    console.log('Webhook test response:', response.data);
    return response.data;
  },
};
