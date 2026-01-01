import http from '@/lib/api/http';
import { ShippingConfig } from '../types/shipping';

export const shippingApi = {
  getConfig: async () => {
    const { data } = await http.get<ShippingConfig>(`/shipping-config`);
    return data;
  },

  // POST: Create configuration
  createConfig: async (config: any) => {
    const { data } = await http.post(`/shipping-config`, config);
    return data;
  },

  // PUT: Update configuration
  updateConfig: async (config: any, shippingCompany: string) => {
    const { data } = await http.put(
      `/shipping-config/${shippingCompany}`,
      config
    );
    return data;
  },

  // DELETE: Delete configuration
  deleteConfig: async () => {
    const { data } = await http.delete(`/shipping-config`);
    return data;
  },
};
