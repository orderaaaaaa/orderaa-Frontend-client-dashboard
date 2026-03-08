export enum IntegrationProvider {
  EASY_ORDERS = 'EASY_ORDERS',
  SHOPIFY = 'SHOPIFY',
}

export enum IntegrationConfigType {
  API = 'API',
  WEBHOOK = 'WEBHOOK',
}

export interface CreateIntegrationRequest {
  storeId: number;
  provider: IntegrationProvider;
  configType: IntegrationConfigType;
  apiKey: string;
}

export interface UpdateIntegrationRequest {
  storeId: number;
  configType: IntegrationConfigType;
  apiKey: string;
  isActive: boolean;
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
}

export interface StoreResponse {
  id: number;
  name: string;
  description: string;
  merchantId: number;
  createdAt: string;
  updatedAt: string;
}
