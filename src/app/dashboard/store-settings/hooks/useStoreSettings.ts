import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantSettingsApi } from '../api/storeApi';
import { OrderSettingsFormData } from '../schemas/store';
import { toast } from 'react-toastify';
import { useUploadFileMutation } from '@/services/upload';
import { QUERY_KEYS } from '@/lib/api/queryKeys';

const SETTINGS_ERROR_AR: Record<string, string> = {
  'defaultShipmentContent is required when employeeCanEditContent is false':
    'محتوى الشحنة الافتراضي مطلوب عند منع الموظف من تعديل المحتوى',
  'logoUrl must be a valid upload URL': 'رابط الشعار غير صالح، أعد رفع الصورة',
};

const hasArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

const toArabicSettingsError = (msg: unknown): string => {
  const fallback = 'فشل تحديث اعدادات المتجر';
  const parts = Array.isArray(msg) ? msg : [msg];
  const mapped = parts
    .filter((m): m is string => typeof m === 'string' && m.length > 0)
    .map((m) => SETTINGS_ERROR_AR[m] ?? (hasArabic(m) ? m : fallback));
  return mapped.length > 0 ? Array.from(new Set(mapped)).join('\n') : fallback;
};

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
        if (
          value !== undefined &&
          (value !== null || key === 'allowConfirmOutOfStock')
        ) {
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
      toast.error(toArabicSettingsError(error?.response?.data?.message));
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    error: settingsQuery.error,
    refetch: settingsQuery.refetch,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
  };
};
