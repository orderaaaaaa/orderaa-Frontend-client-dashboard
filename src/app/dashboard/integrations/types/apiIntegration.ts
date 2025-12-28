// Types and Interfaces
export interface IntegrationRequest {
  provider: string;
  apiKey: string;
  isActive: boolean;
}

export interface IntegrationResponse {
  id: number;
  merchantId: number;
  provider: string;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
