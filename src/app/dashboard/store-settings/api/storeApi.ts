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
    formData: FormData
  ): Promise<MerchantSettingsResponse> => {
    const response = await http.put<MerchantSettingsResponse>(
      '/merchants/settings',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
