import { apiClient } from './index';

export interface CreateWebhookConfigDto {
  webhookUrl: string;
  webhookSecret: string;
}

export interface UpdateWebhookConfigDto {
  webhookUrl?: string;
  webhookSecret?: string;
  isActive?: boolean;
}

export interface WebhookConfigResponse {
  id: number;
  merchantId: number;
  webhookUrl: string;
  isActive: boolean;
  webhookSecret: string;
  createdAt: string;
  updatedAt: string;
}

export const webhookApi = {
  // Create webhook configuration
  createConfig: async (
    data: CreateWebhookConfigDto
  ): Promise<WebhookConfigResponse> => {
    const response = await apiClient.post<WebhookConfigResponse>(
      '/webhooks/config',
      data
    );
    return response.data;
  },

  // Get webhook configuration
  getConfig: async (): Promise<WebhookConfigResponse> => {
    const response = await apiClient.get<WebhookConfigResponse>(
      '/webhooks/config'
    );
    return response.data;
  },

  // Update webhook configuration
  updateConfig: async (
    data: UpdateWebhookConfigDto
  ): Promise<WebhookConfigResponse> => {
    const response = await apiClient.put<WebhookConfigResponse>(
      '/webhooks/config',
      data
    );
    return response.data;
  },

  // Delete webhook configuration
  deleteConfig: async (): Promise<void> => {
    await apiClient.delete('/webhooks/config');
  },

  // Toggle webhook active status
  toggleStatus: async (): Promise<WebhookConfigResponse> => {
    const response = await apiClient.patch<WebhookConfigResponse>(
      '/webhooks/config/toggle'
    );
    return response.data;
  },
};
