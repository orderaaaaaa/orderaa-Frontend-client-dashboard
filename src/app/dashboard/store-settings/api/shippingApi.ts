import http from '@/lib/api/http';

export interface ShippingConfig {
  id: number;
  merchantId: number;
  shippingCompany: string;
  authKey: string;
  clientCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const shippingConfigApi = {
  getShippingConfigs: async (): Promise<ShippingConfig[]> => {
    const response = await http.get<ShippingConfig[]>('/shipping-config');
    return response.data;
  },
};
