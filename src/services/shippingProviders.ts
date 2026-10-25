import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import http from '@/lib/api/http';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { invalidateAndWait } from '@/lib/query/mutationSync';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  markFollowupCancelled,
  markFollowupClosed,
  markFollowupRefused,
  undoFollowupClosure,
  type FollowupReasonBody,
} from '@/lib/api/followup';
import type {
  CarrierStats,
  DeliveryWindowBody,
  DeliveryWindowResponse,
  InProcessFilters,
  InProcessShipmentsPage,
  LateMarkBody,
  LateMarkResponse,
  LocationStats,
  ReturnedFilters,
  ReturnedShipmentsPage,
  ShippingProvider,
  ShippingProviderType,
  StatsRange,
} from '@/types/shippingProviders';

const BASE = '/shipping/providers';
const KEY = 'shipping-providers';

export const useShippingProvidersQuery = (filters?: {
  type?: ShippingProviderType;
  isActive?: boolean;
}) =>
  useQuery({
    queryKey: [KEY, filters],
    queryFn: async () => {
      const { data } = await http.get<ShippingProvider[]>(BASE, {
        params: filters,
      });
      return data;
    },
  });

export const useCarrierStatsQuery = (range: StatsRange) =>
  useQuery({
    queryKey: [KEY, 'stats', range],
    queryFn: async () => {
      const { data } = await http.get<CarrierStats[]>(`${BASE}/stats`, {
        params: range,
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });

export const useCarrierLocationStatsQuery = (
  shippingCompanyId: number | undefined,
  scope: 'governorates' | 'regions',
  range: StatsRange,
) =>
  useQuery({
    queryKey: [KEY, shippingCompanyId, scope, range],
    queryFn: async () => {
      const { data } = await http.get<LocationStats[]>(
        `${BASE}/${shippingCompanyId}/stats/${scope}`,
        { params: range },
      );
      return data;
    },
    enabled: !!shippingCompanyId,
  });

export const useInProcessShipmentsQuery = (
  shippingCompanyId: number | undefined,
  filters: InProcessFilters,
) =>
  useQuery({
    queryKey: [KEY, shippingCompanyId, 'in-process', filters],
    queryFn: async () => {
      const { data } = await http.get<InProcessShipmentsPage>(
        `${BASE}/${shippingCompanyId}/shipments`,
        { params: filters },
      );
      return data;
    },
    enabled: !!shippingCompanyId,
    placeholderData: keepPreviousData,
  });

export const useReturnedShipmentsQuery = (
  shippingCompanyId: number | undefined,
  filters: ReturnedFilters,
) =>
  useQuery({
    queryKey: [KEY, shippingCompanyId, 'returned', filters],
    queryFn: async () => {
      const { data } = await http.get<ReturnedShipmentsPage>(
        `${BASE}/${shippingCompanyId}/returned-shipments`,
        { params: filters },
      );
      return data;
    },
    enabled: !!shippingCompanyId,
    placeholderData: keepPreviousData,
  });

const useShippingProvidersActionMutation = <TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
  messages: { success: string; error: string },
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await invalidateAndWait(queryClient, [[KEY]]);
      toast.success(messages.success);
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, messages.error));
    },
  });
};

export const useSetLateMark = (shippingCompanyId: number | undefined) =>
  useShippingProvidersActionMutation(
    async ({ orderId, body }: { orderId: number; body: LateMarkBody }) => {
      const { data } = await http.post<LateMarkResponse>(
        `${BASE}/${shippingCompanyId}/shipments/${orderId}/late-marks`,
        body,
      );
      return data;
    },
    { success: 'تم حفظ حالة التأخير', error: 'تعذر حفظ حالة التأخير' },
  );

export const useSetDeliveryWindow = (shippingCompanyId: number | undefined) =>
  useShippingProvidersActionMutation(
    async ({ orderId, body }: { orderId: number; body: DeliveryWindowBody }) => {
      const { data } = await http.patch<DeliveryWindowResponse>(
        `${BASE}/${shippingCompanyId}/shipments/${orderId}/delivery-window`,
        body,
      );
      return data;
    },
    { success: 'تم حفظ وقت التوصيل', error: 'تعذر حفظ وقت التوصيل' },
  );

export const useCloseClosure = () =>
  useShippingProvidersActionMutation((orderId: number) => markFollowupClosed(orderId), {
    success: 'تم إغلاق الطلب لليوم',
    error: 'تعذر إغلاق الطلب',
  });

export const useRefuseClosure = () =>
  useShippingProvidersActionMutation(
    ({ orderId, body }: { orderId: number; body: FollowupReasonBody }) =>
      markFollowupRefused(orderId, body),
    { success: 'تم تسجيل رفض التسليم', error: 'تعذر تسجيل رفض التسليم' },
  );

export const useCancelClosure = () =>
  useShippingProvidersActionMutation(
    ({ orderId, body }: { orderId: number; body: FollowupReasonBody }) =>
      markFollowupCancelled(orderId, body),
    { success: 'تم إلغاء الطلب', error: 'تعذر إلغاء الطلب' },
  );

export const useUndoClosure = () =>
  useShippingProvidersActionMutation((orderId: number) => undoFollowupClosure(orderId), {
    success: 'تمت إعادة فتح الطلب',
    error: 'تعذر إعادة فتح الطلب',
  });

export const useCreateShippingProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      type: ShippingProviderType;
      name: string;
      phone?: string;
    }) => {
      const { data } = await http.post<ShippingProvider>(BASE, payload);
      return data;
    },
    onSuccess: async () => {
      await invalidateAndWait(queryClient, [
        [KEY],
        [QUERY_KEYS.SHIPPING_COMPANIES],
      ]);
      toast.success('تمت إضافة جهة الشحن بنجاح');
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, 'تعذر إضافة جهة الشحن'));
    },
  });
};

/** There is no delete: `isActive: false` retires a provider but keeps history. */
export const useUpdateShippingProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: number;
      name?: string;
      phone?: string;
      isActive?: boolean;
    }) => {
      const { id, ...body } = payload;
      const { data } = await http.patch<ShippingProvider>(
        `${BASE}/${id}`,
        body,
      );
      return data;
    },
    onSuccess: async () => {
      await invalidateAndWait(queryClient, [
        [KEY],
        [QUERY_KEYS.SHIPPING_COMPANIES],
      ]);
      toast.success('تم حفظ التعديل');
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, 'تعذر حفظ التعديل'));
    },
  });
};
