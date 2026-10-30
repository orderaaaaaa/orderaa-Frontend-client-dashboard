import http from '@/lib/api/http';
import type { LocationSourceRefreshResponse } from '@/types/canonicalNames';
import { ShippingConfig, ShippingConfigPayload } from '../types/shipping';

export const shippingApi = {
  getConfig: async () => {
    const { data } = await http.get<ShippingConfig[]>(`/shipping-config`);
    return data;
  },

  // POST: Create configuration
  createConfig: async (config: ShippingConfigPayload) => {
    const { data } = await http.post(`/shipping-config`, config);
    return data;
  },

  // POST: Re-sync the carrier's governorate and city list
  requestLocationSync: async (shippingCompany: string) => {
    const { data } = await http.post<LocationSourceRefreshResponse>(
      `/shipping-config/${shippingCompany}/location-sync`
    );
    return data;
  },

  // PUT: Update configuration
  updateConfig: async (config: ShippingConfigPayload, shippingCompany: string) => {
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
