import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantSettingsApi } from '../api/storeApi'; // Adjust path as needed
import { OrderSettingsFormData } from '../schemas/store';
import { toast } from 'react-toastify';

export const useMerchantSettings = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['merchantSettings'],
    queryFn: merchantSettingsApi.getSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: OrderSettingsFormData) =>
      merchantSettingsApi.updateSettings(data),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['merchantSettings'], updatedData);
      toast.success('تم تحديث اعدادات المتجر');
    },
    onError: (error) => {
      console.error('Failed to update settings:', error);
    },
  });

  return {
    // Data and Status
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    error: settingsQuery.error,

    // Actions
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
  };
};
