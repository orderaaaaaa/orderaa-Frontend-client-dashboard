export enum IntegrationProvider {
  EASY_ORDERS = 'EASY_ORDERS',
  SHOPIFY = 'SHOPIFY',
}

export enum IntegrationConfigType {
  API = 'API',
  WEBHOOK = 'WEBHOOK',
}

export interface StoreInfoDto {
  id: number;
  name: string;
  description?: string;
}

export interface CreateIntegrationRequest {
  storeId: number;
  provider: IntegrationProvider;
  configType: IntegrationConfigType;
  apiKey: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateIntegrationRequest {
  storeId?: number;
  configType?: IntegrationConfigType;
  apiKey?: string;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateStoreRequest {
  name?: string;
  description?: string;
}

export interface IntegrationResponse {
  id: number;
  storeId: number;
  merchantId: number;
  provider: IntegrationProvider;
  configType: IntegrationConfigType;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  store?: StoreInfoDto;
  metadata?: Record<string, unknown>;
}

export interface StoreResponse {
  id: number;
  name: string;
  description: string;
  merchantId: number;
  createdAt: string;
  updatedAt: string;
}
