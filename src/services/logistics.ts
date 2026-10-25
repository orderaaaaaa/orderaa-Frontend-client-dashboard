import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import http from '@/lib/api/http';
import {
  GovernorateLogisticsConfig,
  GovernorateLogisticsConfigRow,
  TrackingCard,
  TrackingCardsFilter,
  PartialDeliveryData,
  ExchangeData,
  ReturnRefundData,
  OrderProductChangeLog,
  UpdateTrackingCardData,
} from '@/types/logistics';
import { PaginatedResponse } from '@/types/orders';
import { toast } from 'react-toastify';
import { recordPartialDelivery } from '@/lib/api/order';
import { getApiErrorMessage } from '@/utils/apiError';
import { invalidateStockViews } from '@/services/warehouses';

// ─── Mock Data (UI preview until backend is ready) ───────────────────────────
// The governorate logistics config is no longer mocked — it calls
// /shipping/governorate-settings. The mock governorate list was also removed
// deliberately: it spelled labels as 'القاهرة' while the canonical lookup
// emits 'القاهره', which is exactly the mismatch that keeps these settings
// from ever matching an order. Governorates now come from /lookups/governorates.

// ─── Governorate Logistics Config ────────────────────────────────────────────

export const useGovernorateLogisticsConfig = (shippingCompanyId?: number) => {
  return useQuery({
    queryKey: [
      QUERY_KEYS.GOVERNORATE_LOGISTICS_CONFIG,
      shippingCompanyId,
    ] as QueryKey,
    queryFn: async () => {
      const { data } = await http.get<GovernorateLogisticsConfig[]>(
        '/shipping/governorate-settings',
        { params: { shippingCompanyId } }
      );
      return data;
    },
    enabled: !!shippingCompanyId,
  });
};

/**
 * Replaces one carrier's rows. The backend upserts what is sent and deletes
 * only the governorates left out, so a carrier's accumulated shipping event
 * points survive. `confirmEmpty` is required to submit no rows at all.
 */
export const useUpdateGovernorateLogisticsConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      shippingCompanyId: number;
      rows: GovernorateLogisticsConfigRow[];
      confirmEmpty?: boolean;
    }) => {
      const { data } = await http.put<GovernorateLogisticsConfig[]>(
        `/shipping/governorate-settings/${payload.shippingCompanyId}`,
        { rows: payload.rows, confirmEmpty: payload.confirmEmpty }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          QUERY_KEYS.GOVERNORATE_LOGISTICS_CONFIG,
          variables.shippingCompanyId,
        ],
      });
      toast.success('تم حفظ إعدادات المحافظات بنجاح');
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ?? 'تعذر حفظ إعدادات المحافظات'
      );
    },
  });
};

// ─── Tracking Cards ──────────────────────────────────────────────────────────
// TODO: Replace mock with real API when backend implements GET /logistics/tracking-cards

export const useTrackingCards = (filters: TrackingCardsFilter) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TRACKING_CARDS, filters] as QueryKey,
    queryFn: async () => {
      console.log('[useTrackingCards] filters:', filters);
      await new Promise((r) => setTimeout(r, 300));
      return {
        data: [],
        meta: { currentPage: 1, totalPages: 1, itemsPerPage: 20, totalItems: 0, hasNextPage: false, hasPreviousPage: false },
      } as PaginatedResponse<TrackingCard>;
    },
  });
};

// TODO: Replace mock with real API when backend implements PATCH /logistics/tracking-cards/:cardId
export const useUpdateTrackingCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      cardId: number;
      update: UpdateTrackingCardData;
    }) => {
      console.log('[useUpdateTrackingCard] payload:', data);
      await new Promise((r) => setTimeout(r, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TRACKING_CARDS],
      });
    },
  });
};

// ─── Order Actions (Partial Delivery, Exchange, Return) ──────────────────────

export const usePartialDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PartialDeliveryData) => recordPartialDelivery(data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDER_DETAILS, variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDER_STATISTICS],
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_ORDERS] });
      invalidateStockViews(queryClient);
      toast.success(`تم إنشاء طلب المرتجع ${result.returnOrder.code}`);
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'تعذر تنفيذ التسليم الجزئي'));
    },
  });
};

// TODO: Replace mock with real API when backend implements POST /orders/:orderId/exchange
export const useExchangeOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ExchangeData) => {
      console.log('[useExchangeOrder] payload:', data);
      await new Promise((r) => setTimeout(r, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      toast.success('تم تأكيد الاستبدال بنجاح');
    },
  });
};

// TODO: Replace mock with real API when backend implements POST /orders/:orderId/return
export const useReturnRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReturnRefundData) => {
      console.log('[useReturnRefund] payload:', data);
      await new Promise((r) => setTimeout(r, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      toast.success('تم تأكيد الاسترجاع بنجاح');
    },
  });
};

// ─── Order Product Management (Swap/Modify) ──────────────────────────────────
// TODO: Replace mock with real API when backend implements POST /orders/:orderId/swap-product

export const useSwapOrderProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      orderId: number;
      oldOrderProductId: number;
      newProductId: number;
      newVariants: { label: string; value: string }[];
    }) => {
      console.log('[useSwapOrderProduct] payload:', data);
      await new Promise((r) => setTimeout(r, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      toast.success('تم تغيير المنتج بنجاح');
    },
  });
};

// ─── Order Product Change Logs ───────────────────────────────────────────────
// TODO: Replace mock with real API when backend implements GET /orders/:orderId/product-change-logs

export const useOrderProductChangeLogs = (orderId?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ORDER_PRODUCT_CHANGE_LOGS, orderId] as QueryKey,
    queryFn: async () => {
      console.log('[useOrderProductChangeLogs] orderId:', orderId);
      await new Promise((r) => setTimeout(r, 200));
      return [] as OrderProductChangeLog[];
    },
    enabled: !!orderId,
  });
};
