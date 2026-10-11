import http from '@/lib/api/http';
import {
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
  UpdateStoreRequest,
  IntegrationResponse,
  StoreResponse,
  StockSyncRequest,
  ShopifyLocation,
  QueuedResponse,
  StockPushStatus,
  StockPolicyStatus,
  StockPushLogPage,
  StockPolicyLogPage,
  UnlinkedVariantPage,
  LightfunnelsConnection,
  ConnectLightfunnelsRequest,
  LightfunnelsAuthorizeResponse,
  LightfunnelsRedirectUriResponse,
  SetLightfunnelsWebhookModeRequest,
  SetLightfunnelsWebhookModeResponse,
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

export const stockSyncApi = {
  updateStockSync: async (
    configId: number,
    data: StockSyncRequest
  ): Promise<IntegrationResponse> => {
    const response = await http.patch<IntegrationResponse>(
      `/integration-configs/${configId}/stock-sync`,
      data
    );
    return response.data;
  },

  getShopifyLocations: async (configId: number): Promise<ShopifyLocation[]> => {
    const response = await http.get<ShopifyLocation[]>(
      `/integration-configs/${configId}/shopify-locations`
    );
    return response.data;
  },

  getUnlinked: async (
    configId: number,
    page?: number,
    limit?: number
  ): Promise<UnlinkedVariantPage> => {
    const response = await http.get<UnlinkedVariantPage>(
      `/integration-configs/${configId}/stock-sync/unlinked`,
      { params: { page, limit } }
    );
    return response.data;
  },

  getPushLog: async (
    configId: number,
    params: { status?: StockPushStatus; page?: number; limit?: number }
  ): Promise<StockPushLogPage> => {
    const response = await http.get<StockPushLogPage>(
      `/integration-configs/${configId}/stock-push-log`,
      { params }
    );
    return response.data;
  },

  retry: async (
    configId: number,
    variantIds?: number[]
  ): Promise<QueuedResponse> => {
    const response = await http.post<QueuedResponse>(
      `/integration-configs/${configId}/stock-push/retry`,
      { variantIds }
    );
    return response.data;
  },

  fullPush: async (configId: number): Promise<QueuedResponse> => {
    const response = await http.post<QueuedResponse>(
      `/integration-configs/${configId}/stock-push/full`
    );
    return response.data;
  },

  getPolicyLog: async (
    configId: number,
    params: { status?: StockPolicyStatus; page?: number; limit?: number }
  ): Promise<StockPolicyLogPage> => {
    const response = await http.get<StockPolicyLogPage>(
      `/integration-configs/${configId}/stock-policy-log`,
      { params }
    );
    return response.data;
  },

  retryPolicy: async (configId: number): Promise<QueuedResponse> => {
    const response = await http.post<QueuedResponse>(
      `/integration-configs/${configId}/stock-policy/retry`
    );
    return response.data;
  },
};

export const lightfunnelsApi = {
  getRedirectUri: async (): Promise<LightfunnelsRedirectUriResponse> => {
    const response = await http.get<LightfunnelsRedirectUriResponse>(
      '/integrations/lightfunnels/redirect-uri'
    );
    return response.data;
  },

  getConnections: async (): Promise<LightfunnelsConnection[]> => {
    const response = await http.get<LightfunnelsConnection[]>(
      '/integrations/lightfunnels/connections'
    );
    return response.data;
  },

  connect: async (
    data: ConnectLightfunnelsRequest
  ): Promise<LightfunnelsAuthorizeResponse> => {
    const response = await http.post<LightfunnelsAuthorizeResponse>(
      '/integrations/lightfunnels/connect',
      data
    );
    return response.data;
  },

  setWebhookMode: async (
    storeId: number,
    data: SetLightfunnelsWebhookModeRequest
  ): Promise<SetLightfunnelsWebhookModeResponse> => {
    const response = await http.put<SetLightfunnelsWebhookModeResponse>(
      `/integrations/lightfunnels/connections/${storeId}/webhook-mode`,
      data
    );
    return response.data;
  },
};
