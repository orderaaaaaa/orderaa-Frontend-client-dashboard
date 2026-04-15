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
  TrackingCard,
  TrackingCardsFilter,
  PostShippingReason,
  ShippingCancellationReason,
  PartialDeliveryData,
  ExchangeData,
  ReturnRefundData,
  OrderProductChangeLog,
  UpdateTrackingCardData,
} from '@/types/logistics';
import { PaginatedResponse } from '@/types/orders';
import { toast } from 'react-toastify';

// ─── Mock Data (UI preview until backend is ready) ───────────────────────────

const MOCK_GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحيرة',
  'الشرقية', 'المنوفية', 'الغربية', 'كفر الشيخ', 'القليوبية',
  'بورسعيد', 'الإسماعيلية', 'السويس', 'دمياط', 'المنيا',
  'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان',
  'الفيوم', 'بني سويف', 'شمال سيناء', 'جنوب سيناء', 'مطروح',
  'البحر الأحمر', 'الوادي الجديد', 'الأقصر',
];

const createMockGovernorateConfigs = (
  shippingCompanyId: number
): GovernorateLogisticsConfig[] =>
  MOCK_GOVERNORATES.map((name, index) => ({
    id: shippingCompanyId * 100 + index + 1,
    shippingCompanyId,
    shippingCompanyName: '',
    governorateKey: name.replace(/\s/g, '_'),
    governorateName: name,
    firstAttemptAfterDays: 3,
    shippingCompanyCost: 45,
    nonReceiptCost: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

let mockPostShippingReasons: PostShippingReason[] = [
  { id: 1, reasonName: 'العميل رفض المعاينة', type: 'POST_SHIPPING', isActive: true, displayOrder: 1, usageCount: 12, lastUsedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 2, reasonName: 'الخامة غير مطابقة', type: 'POST_SHIPPING', isActive: true, displayOrder: 2, usageCount: 8, lastUsedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 3, reasonName: 'السعر مختلف عن الموقع', type: 'POST_SHIPPING', isActive: true, displayOrder: 3, usageCount: 5, lastUsedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 4, reasonName: 'العميل مسافر', type: 'POST_SHIPPING', isActive: true, displayOrder: 4, usageCount: 3, lastUsedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 5, reasonName: 'عدم توفر سيولة', type: 'POST_SHIPPING', isActive: true, displayOrder: 5, usageCount: 7, lastUsedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 6, reasonName: 'تم الشراء من مكان آخر', type: 'POST_SHIPPING', isActive: true, displayOrder: 6, usageCount: 2, lastUsedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

let mockReasonNextId = 7;

let mockShippingCancellationReasons: ShippingCancellationReason[] = [
  { id: 1, reasonName: 'تأخر الشحنة', type: 'SHIPPING_CANCELLATION', isActive: true, displayOrder: 1, usageCount: 10, lastUsedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 2, reasonName: 'عنوان خاطئ', type: 'SHIPPING_CANCELLATION', isActive: true, displayOrder: 2, usageCount: 6, lastUsedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 3, reasonName: 'العميل غير متاح', type: 'SHIPPING_CANCELLATION', isActive: true, displayOrder: 3, usageCount: 4, lastUsedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

let mockShippingCancellationNextId = 4;

// ─── Governorate Logistics Config ────────────────────────────────────────────
// TODO: Replace mock with real API when backend implements GET /logistics/governorate-config/:shippingCompanyId

export const useGovernorateLogisticsConfig = (shippingCompanyId?: number) => {
  return useQuery({
    queryKey: [
      QUERY_KEYS.GOVERNORATE_LOGISTICS_CONFIG,
      shippingCompanyId,
    ] as QueryKey,
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      return createMockGovernorateConfigs(shippingCompanyId!);
    },
    enabled: !!shippingCompanyId,
  });
};

// TODO: Replace mock with real API when backend implements PATCH /logistics/governorate-config/:shippingCompanyId
export const useUpdateGovernorateLogisticsConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      shippingCompanyId: number;
      configs: {
        governorateKey: string;
        firstAttemptAfterDays: number;
        shippingCompanyCost: number;
        nonReceiptCost: number;
      }[];
    }) => {
      console.log('[useUpdateGovernorateLogisticsConfig] payload:', data);
      await new Promise((r) => setTimeout(r, 500));
      return { success: true };
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

// ─── Post-Shipping Reasons ───────────────────────────────────────────────────
// TODO: Replace mock with real API when backend implements GET /post-shipping-reasons

export const usePostShippingReasons = (enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.POST_SHIPPING_REASONS] as QueryKey,
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return [...mockPostShippingReasons];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

// TODO: Replace mock with real API when backend implements GET /post-shipping-reasons/top
export const useTopPostShippingReasons = (enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TOP_POST_SHIPPING_REASONS] as QueryKey,
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return [...mockPostShippingReasons].slice(0, 5);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

// TODO: Replace mock with real API when backend implements POST /post-shipping-reasons
export const useCreatePostShippingReason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reasonName: string) => {
      console.log('[useCreatePostShippingReason] payload:', { reasonName });
      await new Promise((r) => setTimeout(r, 300));
      const newReason: PostShippingReason = {
        id: mockReasonNextId++,
        reasonName,
        type: 'POST_SHIPPING',
        isActive: true,
        displayOrder: mockPostShippingReasons.length + 1,
        usageCount: 0,
        lastUsedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockPostShippingReasons.push(newReason);
      return newReason;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.POST_SHIPPING_REASONS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TOP_POST_SHIPPING_REASONS],
      });
    },
  });
};

// TODO: Replace mock with real API when backend implements DELETE /post-shipping-reasons/:reasonId
export const useDeletePostShippingReason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reasonId: number) => {
      console.log('[useDeletePostShippingReason] payload:', { reasonId });
      await new Promise((r) => setTimeout(r, 300));
      mockPostShippingReasons = mockPostShippingReasons.filter(
        (r) => r.id !== reasonId
      );
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.POST_SHIPPING_REASONS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TOP_POST_SHIPPING_REASONS],
      });
    },
  });
};

// ─── Shipping Cancellation Reasons ──────────────────────────────────────────
// TODO: Replace mock with real API when backend implements GET /shipping-cancellation-reasons

export const useShippingCancellationReasons = (enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SHIPPING_CANCELLATION_REASONS] as QueryKey,
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return [...mockShippingCancellationReasons];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

// TODO: Replace mock with real API when backend implements POST /shipping-cancellation-reasons
export const useCreateShippingCancellationReason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reasonName: string) => {
      console.log('[useCreateShippingCancellationReason] payload:', { reasonName });
      await new Promise((r) => setTimeout(r, 300));
      const newReason: ShippingCancellationReason = {
        id: mockShippingCancellationNextId++,
        reasonName,
        type: 'SHIPPING_CANCELLATION',
        isActive: true,
        displayOrder: mockShippingCancellationReasons.length + 1,
        usageCount: 0,
        lastUsedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockShippingCancellationReasons.push(newReason);
      return newReason;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SHIPPING_CANCELLATION_REASONS],
      });
    },
  });
};

// TODO: Replace mock with real API when backend implements DELETE /shipping-cancellation-reasons/:reasonId
export const useDeleteShippingCancellationReason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reasonId: number) => {
      console.log('[useDeleteShippingCancellationReason] payload:', { reasonId });
      await new Promise((r) => setTimeout(r, 300));
      mockShippingCancellationReasons = mockShippingCancellationReasons.filter(
        (r) => r.id !== reasonId
      );
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SHIPPING_CANCELLATION_REASONS],
      });
    },
  });
};

// ─── Order Actions (Partial Delivery, Exchange, Return) ──────────────────────
// TODO: Replace mock with real API when backend implements POST /orders/:orderId/partial-delivery

export const usePartialDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PartialDeliveryData) => {
      console.log('[usePartialDelivery] payload:', data);
      await new Promise((r) => setTimeout(r, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      toast.success('تم تأكيد التسليم الجزئي بنجاح');
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
