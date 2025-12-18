import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
  QueryKey,
} from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import http from '@/lib/api/http';
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
  return useQuery({
    queryKey: [QUERY_KEYS.ORDERS, filters] as QueryKey,
    queryFn: async () => {
      const response = await http.get<PaginatedResponse<Order>>(
        '/orders/all-orders',
        { params: filters }
      );
      return response.data;
    },
  });
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
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
};

// Fetch order statistics
export const useOrderStatisticsQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ORDER_STATISTICS] as QueryKey,
    queryFn: async () => {
      const response =
        await http.get<OrderStatisticsResponse>('/orders/statistics');
      return response.data;
    },
  });
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
        await http.get<OrderStatusesResponse>('/orders/statuses');
      return response.data;
    },
    staleTime: Infinity,
  });
};

// Fetch a single order by ID
export const useOrderById = (id: number | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ORDER_DETAILS, id] as QueryKey,
    queryFn: async () => {
      const response = await http.get<Order>(`/orders/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
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
      const response = await http.patch<Order>(`/orders/${orderId}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDER_DETAILS, variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDER_STATISTICS],
      });
    },
  });
};

// Update order product mutation
export const useUpdateOrderProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderProductId,
      variants,
    }: {
      orderProductId: number;
      variants: { label: string; value: string }[];
    }) => {
      const response = await http.patch(`/orders/order-product/${orderProductId}`, {
        variants,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER_DETAILS] });
    },
  });
};

// Delete order product mutation
export const useDeleteOrderProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderProductId: number) => {
      const response = await http.delete(
        `/orders/order-product/${orderProductId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER_DETAILS] });
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
      variants,
      quantity,
      price,
    }: {
      orderId: number;
      productId: number;
      variants: { label: string; value: string }[];
      quantity: number;
      price: number;
    }) => {
      const response = await http.post(`/orders/${orderId}/products`, {
        productId,
        variants,
        quantity,
        price,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER_DETAILS] });
    },
  });
};

// Phone number entry for API
export interface PhoneNumberEntry {
  phoneNumber: string;
  isPrimary: boolean;
}

// Update customer mutation
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      data,
    }: {
      customerId: number;
      data: {
        name?: string;
        phoneNumbers?: PhoneNumberEntry[];
        governorate?: string;
        city?: string;
        address?: string;
      };
    }) => {
      const response = await http.patch(`/customers/${customerId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER_DETAILS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_ORDERS] });
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
  label: string;
  values: string[];
}

// Selected variant for API payload
export interface SelectedVariant {
  label: string;
  value: string;
}

// API response structure for variant options
interface VariantOptionsApiResponse {
  variantOptions: Array<{
    label?: string;
    values: string[];
  }>;
}

// Fetch product variant options
export const useProductVariantsOptions = (productId: number | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCT_VARIANTS_OPTIONS, productId] as QueryKey,
    queryFn: async () => {
      const response = await http.get<VariantOptionsApiResponse>(
        `/products/${productId}/variants-options`
      );
      // Extract variantOptions array from response and add default labels if missing
      const variantOptions = response.data.variantOptions || [];
      return variantOptions.map((option, index) => ({
        label: option.label || `variant_${index}`,
        values: option.values,
      })) as VariantOption[];
    },
    enabled: !!productId,
  });
};

// Fetch orders for export (bypasses regular query cache, fetches fresh data)
export const useFetchOrdersForExport = () => {
  const fetchOrdersForExport = async (filters: FilterOrdersDto) => {
    const exportFilters = { ...filters, limit: 10000, page: 1 };
    const response = await http.get<PaginatedResponse<Order>>(
      '/orders/all-orders',
      { params: exportFilters }
    );
    return response.data;
  };

  return { fetchOrdersForExport };
};

// Get next order ID for navigation
export const useGetNextOrderId = () => {
  const getNextOrderId = async (
    orderId: number,
    status?: string,
    from?: string,
    to?: string
  ) => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await http.get<{ orderId: number }>(
      `/orders/${orderId}/next`,
      { params }
    );
    return response.data;
  };

  return { getNextOrderId };
};

// Fetch orders for search (one-time fetch, not cached)
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
