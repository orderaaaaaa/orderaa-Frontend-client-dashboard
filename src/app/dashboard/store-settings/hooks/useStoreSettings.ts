import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantSettingsApi } from '../api/storeApi';
import { OrderSettingsFormData } from '../schemas/store';
import { toast } from 'react-toastify';
import { convertToFormData } from '../utils/formDataHelper';
import { QUERY_KEYS } from '@/lib/api/queryKeys';

export const useMerchantSettings = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['merchantSettings'],
    queryFn: merchantSettingsApi.getSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: OrderSettingsFormData) => {
      const formData = convertToFormData(data);
      return merchantSettingsApi.updateSettings(formData);
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
