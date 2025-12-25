import http from '@/lib/api/http';
import { ShippingConfig } from '../types/shipping';

export const shippingApi = {
  // GET: Fetch config for a specific provider
  getConfig: async (providerId: string) => {
    const { data } = await http.get<ShippingConfig>(
      `/shipping-config/${providerId}`
    );
    return data;
  },

  // POST: Create or Update configuration
  upsertConfig: async (config: Partial<ShippingConfig>) => {
    const { data } = await http.post<ShippingConfig>(
      `/shipping-config`,
      config
    );
    return data;
  },

  // GET: Generate a new secure secret for webhooks
  generateSecret: async () => {
    const { data } = await http.get<{ secret: string }>(
      '/shipping-config/generate-secret'
    );
    return data;
  },
};
