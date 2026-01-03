import http from '@/lib/api/http';
import { IntegrationResponse } from '../types/apiIntegration';

export const integrationApi = {
  // GET /integration-configs
  getAll: async (): Promise<IntegrationResponse[]> => {
    const response = await http.get<IntegrationResponse[]>(
      '/integration-configs'
    );
    return response.data;
  },

  // POST /integration-configs
  create: async (apiKey: string): Promise<IntegrationResponse> => {
    const payload = {
      provider: 'EASY_ORDERS',
      apiKey: apiKey,
      isActive: true,
    };
    const response = await http.post<IntegrationResponse>(
      '/integration-configs',
      payload
    );
    return response.data;
  },

  // PATCH /integration-configs/{id}
  update: async (
    provider: string,
    apiKey: string
  ): Promise<IntegrationResponse> => {
    const payload = {
      apiKey: apiKey,
      isActive: true,
    };
    const response = await http.put<IntegrationResponse>(
      `/integration-configs/${provider}`,
      payload
    );
    return response.data;
  },
};
