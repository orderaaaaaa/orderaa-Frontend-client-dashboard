import http from '@/lib/api/http';
import { OrderSettingsFormData } from '../schemas/store';
import { MerchantSettingsResponse } from '../types/store';

export const merchantSettingsApi = {
  getSettings: async (): Promise<MerchantSettingsResponse> => {
    const response = await http.get<MerchantSettingsResponse>(
      '/merchants/settings'
    );
    return response.data;
  },

  updateSettings: async (
    data: OrderSettingsFormData
  ): Promise<MerchantSettingsResponse> => {
    const response = await http.put<MerchantSettingsResponse>(
      '/merchants/settings',
      data
    );
    return response.data;
  },
};
