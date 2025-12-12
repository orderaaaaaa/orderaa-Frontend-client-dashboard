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
      variant,
    }: {
      orderProductId: number;
      variant: string;
    }) => {
      const response = await http.patch(`/orders/order-product/${orderProductId}`, {
        variant,
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
      variant,
      quantity,
      price,
    }: {
      orderId: number;
      productId: number;
      variant: string;
      quantity: number;
      price: number;
    }) => {
      const response = await http.post(`/orders/${orderId}/products`, {
        productId,
        variant,
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
        phoneNumber?: string;
        altPhone?: string;
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
      const response = await http.get('/orders/products');
      return response.data;
    },
  });
};
