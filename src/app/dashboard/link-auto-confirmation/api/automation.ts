import http from '@/lib/api/http';
import {
  AvailableAutomationProvidersResponse,
  AutoConfirmationConfig,
  CreateAutoConfirmationConfigRequest,
  UpdateAutoConfirmationConfigRequest,
} from '../types/autoConfirmation';

export const automationConfigApi = {
  getProviders: async (): Promise<AvailableAutomationProvidersResponse> => {
    const response = await http.get<AvailableAutomationProvidersResponse>(
      '/automation-configs/providers'
    );
    return response.data;
  },

  getAll: async (): Promise<AutoConfirmationConfig[]> => {
    const response = await http.get<AutoConfirmationConfig[]>(
      '/automation-configs'
    );
    return response.data;
  },

  getById: async (configId: number): Promise<AutoConfirmationConfig> => {
    const response = await http.get<AutoConfirmationConfig>(
      `/automation-configs/${configId}`
    );
    return response.data;
  },

  create: async (
    data: CreateAutoConfirmationConfigRequest
  ): Promise<AutoConfirmationConfig> => {
    const response = await http.post<AutoConfirmationConfig>(
      '/automation-configs',
      data
    );
    return response.data;
  },

  update: async (
    configId: number,
    data: UpdateAutoConfirmationConfigRequest
  ): Promise<AutoConfirmationConfig> => {
    const response = await http.put<AutoConfirmationConfig>(
      `/automation-configs/${configId}`,
      data
    );
    return response.data;
  },

  delete: async (configId: number): Promise<void> => {
    await http.delete(`/automation-configs/${configId}`);
  },
};

export const getAutomationConfigErrorMessage = (
  err: unknown,
  fallback: string
): string => {
  const error = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return error.response?.data?.message || error.message || fallback;
};
