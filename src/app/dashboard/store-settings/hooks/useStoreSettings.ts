import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantSettingsApi } from '../api/storeApi';
import { OrderSettingsFormData } from '../schemas/store';
import { toast } from 'react-toastify';
import { convertToFormData } from '../utils/formDataHelper';

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
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['merchantSettings'], updatedData);
      toast.success('تم تحديث اعدادات المتجر');
    },
    onError: (error) => {
      console.error('Failed to update settings:', error);
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
