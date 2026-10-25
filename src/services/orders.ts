import {
  useQuery,
  useQueries,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
  keepPreviousData,
  queryOptions,
  QueryKey,
} from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  invalidateAndWait,
  orderStatusKeys,
  readFreshQueryData,
  useHeldUntilSettled,
} from '@/lib/query/mutationSync';
import http from '@/lib/api/http';
import { getProductAttributeOptions } from '@/lib/api/products';
import type { CarrierSendBearingResponse } from '@/types/carrierSends';
import {
  CARRIER_SEND_NOT_SENT_WARNING,
  carrierSendNeedsAttention,
} from '@/utils/manualOrder/carrierSend';
import {
  Order,
  FilterOrdersDto,
  PaginatedResponse,
  FilterOptionsResponse,
  OrderStatisticsResponse,
  OrderStatusesResponse,
  Product,
} from '@/types/orders';

// Fetch orders with filters and pagination
export const useOrders = (filters: FilterOrdersDto) => {
  const query = useQuery({
    queryKey: [QUERY_KEYS.ORDERS, filters] as QueryKey,
    queryFn: async () => {
      const response = await http.get<PaginatedResponse<Order>>(
        '/orders/all-orders',
        { params: filters }
      );
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
  const data = useHeldUntilSettled(query.data, query.dataUpdatedAt, [
    [QUERY_KEYS.ORDER_STATISTICS],
  ]);
  return { ...query, data };
};

// Infinite scroll query for orders
export const useInfiniteOrders = (filters: Omit<FilterOrdersDto, 'page'>) => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.ORDERS, 'infinite', filters] as QueryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await http.get<PaginatedResponse<Order>>(
        '/orders/all-orders',
        {
          params: { ...filters, page: pageParam },
        }
      );
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.hasNextPage) {
        return lastPage.meta.currentPage + 1;
      }
      return undefined;
    },
  });
};

// Fetch order statistics
export const useOrderStatisticsQuery = (filters?: FilterOrdersDto) => {
  const {
    page,
    limit,
    skipFilters,
    orderByDirection,
    status,
    ...statisticsFilters
  } = filters ?? {};

  const query = useQuery({
    queryKey: [QUERY_KEYS.ORDER_STATISTICS, statisticsFilters] as QueryKey,
    queryFn: async () => {
      const response = await http.get<OrderStatisticsResponse>(
        '/orders/statistics',
        { params: statisticsFilters }
      );
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
  const data = useHeldUntilSettled(query.data, query.dataUpdatedAt, [
    [QUERY_KEYS.ORDERS],
    { queryKey: [QUERY_KEYS.ORDER_DETAILS], keyLength: 2 },
  ]);
  return { ...query, data };
};

// Fetch filter options (governorates, cities, products, etc.)

export const useFilterOptionsQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ORDER_FILTER_OPTIONS] as QueryKey,
    queryFn: async () => {
      const response =
        await http.get<FilterOptionsResponse>('/orders/filter-options');
      return response.data;
    },
    staleTime: Infinity,
  });
};

// Fetch order statuses
export const useOrderStatusesQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ORDER_STATUSES] as QueryKey,
    queryFn: async () => {
      const response =
        await http.get<OrderStatusesResponse>('/lookups/order-statuses');
      // Read `allStatuses` defensively: staleTime is Infinity, so a session
      // opened before the backend deploy still holds the old response shape.
      const statuses = response.data.statuses ?? [];
      return { statuses, allStatuses: response.data.allStatuses ?? statuses };
    },
    staleTime: Infinity,
  });
};

// Fetch department-specific statuses
export const useDepartmentStatusesQuery = (department: string | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DEPARTMENT_STATUSES, department] as QueryKey,
    queryFn: async () => {
      const response = await http.get<{ statuses: string[] }>(
        '/orders/department-statuses',
        { params: { department } }
      );
      return response.data.statuses;
    },
    enabled: !!department,
    staleTime: Infinity,
  });
};

// Fetch a single order by ID
export const useOrderById = (id: number | null) => {
  const query = useQuery({
    ...orderDetailsQueryOptions(id),
    enabled: !!id,
  });
  const arrivalRef = useRef<{
    id: number | null;
    at: number;
    prefetchedAt: number | undefined;
  } | null>(null);
  if (arrivalRef.current === null || arrivalRef.current.id !== id) {
    arrivalRef.current = {
      id,
      at: Date.now(),
      prefetchedAt:
        navigationPrefetch?.id === id
          ? navigationPrefetch.dataUpdatedAt
          : undefined,
    };
  }
  const arrival = arrivalRef.current;
  useEffect(() => {
    if (navigationPrefetch?.id === id) {
      navigationPrefetch = null;
    }
  }, [id]);
  const isDisplayable =
    query.data !== undefined &&
    (query.dataUpdatedAt >= arrival.at ||
      query.dataUpdatedAt === arrival.prefetchedAt);
  const data = useHeldUntilSettled(
    isDisplayable ? query.data : undefined,
    query.dataUpdatedAt,
    [[QUERY_KEYS.ORDER_STATISTICS]],
    id
  );
  return {
    ...query,
    data,
    isLoading: data === undefined && (query.isLoading || query.isFetching),
    liveData: query.data,
  };
};

const ORDER_DETAILS_GC_TIME = 60 * 1000;

export const orderDetailsQueryOptions = (id: number | null) =>
  queryOptions({
    queryKey: [QUERY_KEYS.ORDER_DETAILS, id] as QueryKey,
    queryFn: async () => {
      const response = await http.get<Order>(`/orders/${id}`);
      return response.data;
    },
    staleTime: 0,
    gcTime: ORDER_DETAILS_GC_TIME,
  });

let navigationPrefetch: { id: number; dataUpdatedAt: number } | null = null;

export const usePrefetchOrderDetails = () => {
  const queryClient = useQueryClient();
  const prefetchOrderDetails = useCallback(
    (id: number) => queryClient.prefetchQuery(orderDetailsQueryOptions(id)),
    [queryClient]
  );
  const claimPrefetchedOrderDetails = useCallback(
    (id: number, fetchedSince: number) => {
      const state = queryClient.getQueryState<Order>(
        orderDetailsQueryOptions(id).queryKey
      );
      navigationPrefetch =
        state?.data !== undefined && state.dataUpdatedAt >= fetchedSince
          ? { id, dataUpdatedAt: state.dataUpdatedAt }
          : null;
    },
    [queryClient]
  );
  return { prefetchOrderDetails, claimPrefetchedOrderDetails };
};

// Fetch customer orders by phone number
export const useCustomerOrders = (
  phone: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CUSTOMER_ORDERS, phone] as QueryKey,
    queryFn: async () => {
      const response = await http.get<PaginatedResponse<Order>>(
        '/orders/all-orders',
        {
          params: {
            customerPhone: phone,
            limit: 1000,
            page: 1,
          },
        }
      );
      return response.data;
    },
    enabled: options?.enabled !== false && !!phone,
  });
};

const warnIfCarrierSendNeedsAttention = (response: CarrierSendBearingResponse | null | undefined) => {
  if (carrierSendNeedsAttention(response?.carrierSend)) {
    toast.warning(CARRIER_SEND_NOT_SENT_WARNING);
  }
};

// Update order mutation
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      data,
    }: {
      orderId: number;
      data: Partial<Order> | Record<string, unknown>;
    }) => {
      const response = await http.patch<Order & CarrierSendBearingResponse>(`/orders/${orderId}`, data);
      const respondedAt = Date.now();
      await invalidateAndWait(queryClient, [...orderStatusKeys(orderId), [QUERY_KEYS.CARRIER_SENDS]]);
      warnIfCarrierSendNeedsAttention(response.data);
      return readFreshQueryData(
        queryClient,
        [QUERY_KEYS.ORDER_DETAILS, orderId],
        respondedAt,
        response.data
      );
    },
  });
};

// Update order product mutation
export const useUpdateOrderProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderProductId,
      attributeOptionIds,
      sendBackToPackaging,
    }: {
      orderProductId: number;
      attributeOptionIds: number[];
      sendBackToPackaging?: boolean;
    }) => {
      const response = await http.patch<CarrierSendBearingResponse>(`/orders/order-product/${orderProductId}`, {
        attributeOptionIds,
        ...(sendBackToPackaging ? { sendBackToPackaging: true } : {}),
      });
      return response.data;
    },
    onSuccess: (data) => {
      warnIfCarrierSendNeedsAttention(data);
      return invalidateAndWait(queryClient, [
        [QUERY_KEYS.ORDER_DETAILS],
        [QUERY_KEYS.ORDERS],
        [QUERY_KEYS.CARRIER_SENDS],
      ]);
    },
  });
};

// Delete order product mutation
export const useDeleteOrderProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderProductId,
      sendBackToPackaging,
    }: {
      orderProductId: number;
      sendBackToPackaging?: boolean;
    }) => {
      const response = await http.delete<CarrierSendBearingResponse>(
        `/orders/order-product/${orderProductId}`,
        { params: sendBackToPackaging ? { sendBackToPackaging: true } : undefined }
      );
      return response.data;
    },
    onSuccess: (data) => {
      warnIfCarrierSendNeedsAttention(data);
      return invalidateAndWait(queryClient, [
        [QUERY_KEYS.ORDER_DETAILS],
        [QUERY_KEYS.ORDERS],
        [QUERY_KEYS.CARRIER_SENDS],
      ]);
    },
  });
};

// Add product to order mutation
export const useAddOrderProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      productId,
      attributeOptionIds,
      quantity,
      sendBackToPackaging,
    }: {
      orderId: number;
      productId: number;
      attributeOptionIds: number[];
      quantity: number;
      sendBackToPackaging?: boolean;
    }) => {
      const response = await http.post<CarrierSendBearingResponse>(`/orders/${orderId}/products`, {
        productId,
        attributeOptionIds,
        quantity,
        ...(sendBackToPackaging ? { sendBackToPackaging: true } : {}),
      });
      return response.data;
    },
    onSuccess: (data) => {
      warnIfCarrierSendNeedsAttention(data);
      return invalidateAndWait(queryClient, [
        [QUERY_KEYS.ORDER_DETAILS],
        [QUERY_KEYS.ORDERS],
        [QUERY_KEYS.CARRIER_SENDS],
      ]);
    },
  });
};

// Update customer mutation
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      orderId,
      data,
    }: {
      customerId: number;
      orderId?: number;
      data: {
        name?: string;
        phoneNumbers?: string[];
        governorate?: string;
        city?: string;
        address?: string;
      };
    }) => {
      const response = await http.patch<CarrierSendBearingResponse>(`/customers/${customerId}`, data, {
        params: orderId === undefined ? undefined : { orderId },
      });
      return response.data;
    },
    onSuccess: (data) => {
      warnIfCarrierSendNeedsAttention(data);
      return invalidateAndWait(queryClient, [
        [QUERY_KEYS.ORDER_DETAILS],
        [QUERY_KEYS.ORDERS],
        [QUERY_KEYS.CUSTOMER_ORDERS],
        [QUERY_KEYS.CARRIER_SENDS],
      ]);
    },
  });
};

// Fetch all products
export const useAllProducts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS] as QueryKey,
    queryFn: async () => {
      const response = await http.get<Product[]>('/orders/products');
      return response.data;
    },
  });
};

// Variant option from API
export interface VariantOption {
  attribute: string;
  options: { id: number; name: string }[];
}

// Selected variant for API payload
export interface SelectedVariant {
  attribute: string;
  option: string;
}

export const resolveAttributeOptionIds = (
  variantOptions: VariantOption[],
  selectedVariants: Record<string, string>
): number[] => {
  return Object.entries(selectedVariants).reduce<number[]>(
    (ids, [attribute, optionValue]) => {
      const group = variantOptions.find((o) => o.attribute === attribute);
      const option = group?.options.find((o) => o.name === optionValue);
      if (option) ids.push(option.id);
      return ids;
    },
    []
  );
};

const fetchProductVariantsOptions = async (productId: number) => {
  const { options: attributeOptions } = await getProductAttributeOptions(productId);
  return (attributeOptions || []).map((attribute, index) => ({
    attribute: attribute.name || `attribute_${index}`,
    options: (attribute.options || []).map((option) => ({
      id: option.id,
      name: option.name,
    })),
  })) as VariantOption[];
};

export const useProductVariantsOptions = (productId: number | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCT_VARIANTS_OPTIONS, productId] as QueryKey,
    queryFn: () => fetchProductVariantsOptions(productId!),
    enabled: !!productId,
  });
};

export interface ProductsVariantsOptions {
  byProductId: Map<number, VariantOption[]>;
  isPending: boolean;
}

export const useProductsVariantsOptions = (
  productIds: readonly number[]
): ProductsVariantsOptions => {
  const uniqueIds = Array.from(new Set(productIds));
  return useQueries({
    queries: uniqueIds.map((productId) => ({
      queryKey: [QUERY_KEYS.PRODUCT_VARIANTS_OPTIONS, productId] as QueryKey,
      queryFn: () => fetchProductVariantsOptions(productId),
    })),
    combine: (results) => {
      const byProductId = new Map<number, VariantOption[]>();
      results.forEach((result, index) => {
        if (result.data) byProductId.set(uniqueIds[index], result.data);
      });
      return {
        byProductId,
        isPending: results.some((result) => result.isPending),
      };
    },
  });
};

// Get next order ID for navigation
export const useGetNextOrderId = () => {
  const getNextOrderId = async (
    orderId: number,
    filters: Partial<FilterOrdersDto> = {}
  ) => {
    const { page, limit, ...rest } = filters;
    const response = await http.get<{ id: number }>(
      `/orders/${orderId}/next`,
      { params: rest }
    );
    return response.data;
  };

  return { getNextOrderId };
};

// Get previous order ID for navigation
export const useGetPreviousOrderId = () => {
  const getPreviousOrderId = async (
    orderId: number,
    filters: Partial<FilterOrdersDto> = {}
  ) => {
    const { page, limit, ...rest } = filters;
    const response = await http.get<{ id: number }>(
      `/orders/${orderId}/previous`,
      { params: rest }
    );
    return response.data;
  };

  return { getPreviousOrderId };
};

export const useFetchOrdersForSearch = () => {
  const fetchOrdersForSearch = async (filters: FilterOrdersDto) => {
    const response = await http.get<PaginatedResponse<Order>>(
      '/orders/all-orders',
      { params: filters }
    );
    return response.data;
  };

  return { fetchOrdersForSearch };
};

export type CancellationReasonType = 'GENERAL' | 'SHIPPING_CANCELLATION' | 'REFUSAL_TO_ACCEPT';

// Cancellation reason interface
export interface CancellationReason {
  id: number;
  reasonName: string;
  type: CancellationReasonType;
  isActive: boolean;
  usageCount: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TopCancellationReason = Pick<CancellationReason, 'id' | 'reasonName' | 'usageCount'>;

export interface CreateCancellationReasonPayload {
  reasonName: string;
  type: CancellationReasonType;
}

export interface UpdateCancellationReasonPayload {
  reasonName?: string;
  type?: CancellationReasonType;
  isActive?: boolean;
}

// Fetch all cancellation reasons
export const useCancellationReasons = (enabled: boolean = true, type?: CancellationReasonType) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CANCELLATION_REASONS, type] as QueryKey,
    queryFn: async () => {
      const response = await http.get<CancellationReason[]>('/cancellation-reasons', {
        params: { type },
      });
      return response.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch top 5 cancellation reasons
export const useTopCancellationReasons = (enabled: boolean = true, type?: CancellationReasonType) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TOP_CANCELLATION_REASONS, type] as QueryKey,
    queryFn: async () => {
      const response = await http.get<TopCancellationReason[]>('/cancellation-reasons/top', {
        params: { type },
      });
      return response.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateCancellationReason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCancellationReasonPayload) => {
      const response = await http.post<CancellationReason>('/cancellation-reasons', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CANCELLATION_REASONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOP_CANCELLATION_REASONS] });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, 'تعذر حفظ السبب'));
    },
  });
};

export const useUpdateCancellationReason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateCancellationReasonPayload }) => {
      const response = await http.patch<CancellationReason>(`/cancellation-reasons/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CANCELLATION_REASONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOP_CANCELLATION_REASONS] });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, 'تعذر تحديث السبب'));
    },
  });
};

// Cancel order mutation
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      reasonId,
      notes,
    }: {
      orderId: number;
      reasonId: number;
      notes?: string;
    }) => {
      const response = await http.post<Order>(`/orders/${orderId}/cancel`, {
        cancelReasonId: reasonId,
        cancelNotes: notes,
      });
      const respondedAt = Date.now();
      await invalidateAndWait(queryClient, orderStatusKeys(orderId));
      return readFreshQueryData(
        queryClient,
        [QUERY_KEYS.ORDER_DETAILS, orderId],
        respondedAt,
        response.data
      );
    },
  });
};
