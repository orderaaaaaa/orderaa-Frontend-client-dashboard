import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import http from '@/lib/api/http';
import { CUSTOMERS_QUERY_KEY } from '@/app/dashboard/customers/hooks/useGetCustomers';
import { CUSTOMER_BADGE_COUNTS_QUERY_KEY } from '@/app/dashboard/customers/hooks/useCustomerBadgeCounts';
import type {
  CustomerBadgeSettings,
  UpdateCustomerBadgeSettingsPayload,
} from '@/app/dashboard/customers/types/customer';

export const CUSTOMER_BADGE_SETTINGS_QUERY_KEY = ['customer-badge-settings'] as const;

const BADGE_SETTINGS_URL = '/customers/badge-settings';

const ARABIC_PATTERN = /[؀-ۿ]/;

export const toArabicBadgeSettingsError = (error: unknown, fallback: string) => {
  const raw = (
    error as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  const parts = (Array.isArray(raw) ? raw : [raw]).filter(
    (part): part is string => typeof part === 'string' && ARABIC_PATTERN.test(part)
  );
  return parts.length > 0 ? Array.from(new Set(parts)).join('\n') : fallback;
};

export const customerBadgeSettingsApi = {
  get: async () => {
    const { data } = await http.get<CustomerBadgeSettings>(BADGE_SETTINGS_URL);
    return data;
  },
  update: async (payload: UpdateCustomerBadgeSettingsPayload) => {
    const { data } = await http.put<CustomerBadgeSettings>(
      BADGE_SETTINGS_URL,
      payload
    );
    return data;
  },
  reset: async () => {
    const { data } = await http.delete<CustomerBadgeSettings>(BADGE_SETTINGS_URL);
    return data;
  },
};

export function useCustomerBadgeSettings(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: CUSTOMER_BADGE_SETTINGS_QUERY_KEY,
    queryFn: customerBadgeSettingsApi.get,
    enabled: options.enabled ?? true,
  });
}

function useApplyBadgeSettings() {
  const queryClient = useQueryClient();
  return (settings: CustomerBadgeSettings) => {
    queryClient.setQueryData(CUSTOMER_BADGE_SETTINGS_QUERY_KEY, settings);
    queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: CUSTOMER_BADGE_COUNTS_QUERY_KEY });
  };
}

export function useUpdateCustomerBadgeSettings() {
  const apply = useApplyBadgeSettings();
  return useMutation({
    mutationFn: customerBadgeSettingsApi.update,
    onSuccess: (settings) => {
      apply(settings);
      toast.success('تم حفظ إعدادات شارات العملاء');
    },
    onError: (error) => {
      toast.error(
        toArabicBadgeSettingsError(error, 'تعذّر حفظ إعدادات شارات العملاء')
      );
    },
  });
}

export function useResetCustomerBadgeSettings() {
  const apply = useApplyBadgeSettings();
  return useMutation({
    mutationFn: customerBadgeSettingsApi.reset,
    onSuccess: (settings) => {
      apply(settings);
      toast.success('تمت استعادة الإعدادات الافتراضية لشارات العملاء');
    },
    onError: (error) => {
      toast.error(
        toArabicBadgeSettingsError(error, 'تعذّرت استعادة الإعدادات الافتراضية')
      );
    },
  });
}
