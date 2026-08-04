import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantSettingsApi } from '../api/storeApi';
import { OrderSettingsFormData } from '../schemas/store';
import { toast } from 'react-toastify';
import { useUploadFileMutation } from '@/services/upload';
import { QUERY_KEYS } from '@/lib/api/queryKeys';

export const useMerchantSettings = () => {
  const queryClient = useQueryClient();
  const uploadMutation = useUploadFileMutation();

  const getLogoFile = (logo: OrderSettingsFormData['logo']): File | null => {
    if (logo instanceof File) return logo;
    if (logo && typeof logo === 'object' && 'length' in logo && logo.length > 0) {
      return (logo as FileList)[0] ?? null;
    }
    return null;
  };

  const settingsQuery = useQuery({
    queryKey: ['merchantSettings'],
    queryFn: merchantSettingsApi.getSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: OrderSettingsFormData) => {
      const payload: Record<string, unknown> = {};
      (Object.keys(data) as (keyof OrderSettingsFormData)[]).forEach((key) => {
        if (key === 'logo') return;
        const value = data[key];
        if (value !== undefined && value !== null) {
          payload[key] = value;
        }
      });

      const logoFile = getLogoFile(data.logo);
      if (logoFile) {
        const uploadResult = await uploadMutation.mutateAsync(logoFile);
        payload.logoUrl = uploadResult.url;
      }

      return merchantSettingsApi.updateSettings(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantSettings'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAGE_NAMES] });
      toast.success('تم تحديث اعدادات المتجر');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join('\n') : msg || 'فشل تحديث اعدادات المتجر');
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    error: settingsQuery.error,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
  };
};
