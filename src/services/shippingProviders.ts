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
import { CARRIER_SEND_NOT_SENT_WARNING, carrierSendNeedsAttention } from '@/utils/manualOrder/carrierSend';
import {
  markFollowupCancelled,
  markFollowupClosed,
  markFollowupClosedBulk,
  markFollowupRefused,
  undoFollowupClosure,
  type FollowupReasonBody,
} from '@/lib/api/followup';
import type { CarrierSendBearingResponse, SuccessResponse } from '@/types/carrierSends';
import type { Order } from '@/types/orders';
import type {
  CarrierStats,
  DeliveryWindowBody,
  DeliveryWindowResponse,
  InProcessCountFilters,
  InProcessFilters,
  InProcessShipmentsPage,
  LateMarkBody,
  LateMarkResponse,
  LocationStats,
  ReturnedFilters,
  ReturnedShipmentsPage,
  ShippingProvider,
  ShipmentAddressBody,
  ShipmentCounts,
  ShipmentCustomerPhoneBody,
  ShipmentCustomerPhoneResponse,
  ShipmentPriceBody,
  ShipmentReturnCostBody,
  ShippingProviderType,
  StatsRange,
} from '@/types/shippingProviders';

const BASE = '/shipping/providers';
export const KEY = 'shipping-providers';

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

export const useInProcessCountsQuery = (
  shippingCompanyId: number | undefined,
  filters: InProcessCountFilters,
) =>
  useQuery({
    queryKey: [KEY, shippingCompanyId, 'in-process-counts', filters],
    queryFn: async () => {
      const { data } = await http.get<ShipmentCounts>(
        `${BASE}/${shippingCompanyId}/shipments/counts`,
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

export const useSendAgainRecordMutation = () =>
  useShippingProvidersActionMutation(
    async ({ orderId, reason }: { orderId: number; reason: string }) => {
      const { data } = await http.post<SuccessResponse>(
        `/orders/${orderId}/send-again-record`,
        { reason },
      );
      return data;
    },
    { success: 'تم تسجيل إعادة الإرسال', error: 'تعذر تسجيل إعادة الإرسال' },
  );

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

type ShipmentEditResponse = Order & CarrierSendBearingResponse;

interface ShipmentEditOptions {
  isInlineError?: (err: unknown) => boolean;
  extraQueryKeys?: string[];
}

const useShipmentEditMutation = <TVariables, TResult extends CarrierSendBearingResponse>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
  messages: { success: string; error: string },
  { isInlineError = () => false, extraQueryKeys = [] }: ShipmentEditOptions = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async (data) => {
      await invalidateAndWait(queryClient, [
        [KEY],
        [QUERY_KEYS.ORDER_DETAILS],
        [QUERY_KEYS.ORDERS],
        [QUERY_KEYS.CARRIER_SENDS],
        ...extraQueryKeys.map((key) => [key]),
      ]);
      if (carrierSendNeedsAttention(data.carrierSend)) {
        toast.warning(CARRIER_SEND_NOT_SENT_WARNING);
      }
      toast.success(messages.success);
    },
    onError: (err: unknown) => {
      if (isInlineError(err)) return;
      toast.error(getApiErrorMessage(err, messages.error));
    },
  });
};

export const CUSTOMER_PHONE_TAKEN_CODE = 'PHONE_NUMBER_ALREADY_EXISTS';
export const CUSTOMER_PHONE_INVALID_CODE = 'SHIPPING_PROVIDER_CUSTOMER_PHONE_INVALID';

export const customerPhoneErrorCodeOf = (error: unknown): string | null => {
  const code = (error as { response?: { data?: { code?: string } } } | null)?.response?.data?.code;
  return code === CUSTOMER_PHONE_TAKEN_CODE || code === CUSTOMER_PHONE_INVALID_CODE ? code : null;
};

export const useUpdateShipmentAddress = (shippingCompanyId: number | undefined) =>
  useShipmentEditMutation(
    async ({ orderId, body }: { orderId: number; body: ShipmentAddressBody }) => {
      const { data } = await http.patch<ShipmentEditResponse>(
        `${BASE}/${shippingCompanyId}/shipments/${orderId}/address`,
        body,
      );
      return data;
    },
    { success: 'تم تحديث العنوان', error: 'تعذر تحديث العنوان' },
  );

export const useUpdateShipmentPrice = (shippingCompanyId: number | undefined) =>
  useShipmentEditMutation(
    async ({ orderId, body }: { orderId: number; body: ShipmentPriceBody }) => {
      const { data } = await http.patch<ShipmentEditResponse>(
        `${BASE}/${shippingCompanyId}/shipments/${orderId}/price`,
        body,
      );
      return data;
    },
    { success: 'تم تحديث السعر', error: 'تعذر تحديث السعر' },
  );

export const useUpdateShipmentReturnCost = (shippingCompanyId: number | undefined) =>
  useShipmentEditMutation(
    async ({ orderId, body }: { orderId: number; body: ShipmentReturnCostBody }) => {
      const { data } = await http.patch<ShipmentEditResponse>(
        `${BASE}/${shippingCompanyId}/shipments/${orderId}/return-cost`,
        body,
      );
      return data;
    },
    { success: 'تم تحديث تكلفة المرتجع', error: 'تعذر تحديث تكلفة المرتجع' },
  );

export const useAddShipmentCustomerPhone = (shippingCompanyId: number | undefined) =>
  useShipmentEditMutation(
    async ({ orderId, body }: { orderId: number; body: ShipmentCustomerPhoneBody }) => {
      const { data } = await http.post<ShipmentCustomerPhoneResponse>(
        `${BASE}/${shippingCompanyId}/shipments/${orderId}/customer-phones`,
        body,
      );
      return data;
    },
    { success: 'تمت إضافة رقم الهاتف', error: 'تعذر إضافة رقم الهاتف' },
    {
      isInlineError: (err) => customerPhoneErrorCodeOf(err) !== null,
      extraQueryKeys: [QUERY_KEYS.CUSTOMER_ORDERS, QUERY_KEYS.DELAYED_ORDERS, 'customer', 'customers'],
    },
  );

export const useCloseClosure = () =>
  useShippingProvidersActionMutation((orderId: number) => markFollowupClosed(orderId), {
    success: 'تم إغلاق الطلب لليوم',
    error: 'تعذر إغلاق الطلب',
  });

export const useBulkCloseClosure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderIds: number[]) => markFollowupClosedBulk(orderIds),
    onSuccess: async () => {
      await invalidateAndWait(queryClient, [[KEY]]);
    },
  });
};

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
