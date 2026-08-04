import http from '@/lib/api/http';
import { MerchantSettingsResponse } from '../types/store';

export const merchantSettingsApi = {
  getSettings: async (): Promise<MerchantSettingsResponse> => {
    const response = await http.get<MerchantSettingsResponse>(
      '/merchants/settings'
    );
    return response.data;
  },

  updateSettings: async (
    payload: Record<string, unknown>
  ): Promise<MerchantSettingsResponse> => {
    const response = await http.put<MerchantSettingsResponse>(
      '/merchants/settings',
      payload
    );
    return response.data;
  },
};
