import { useState, useEffect, useCallback } from 'react';
import { getOrders } from '@/lib/api/orders';
import {
  FilterOrdersDto,
  Order,
  PaginatedOrdersResponse,
} from '@/types/orders';

interface UseOrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  meta: PaginatedOrdersResponse['meta'] | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching orders with filters and pagination
 * @param filters - Query parameters for filtering
 * @param enabled - Whether to fetch automatically
 */
export function useOrders(
  filters?: FilterOrdersDto,
  enabled: boolean = true
): UseOrdersState {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginatedOrdersResponse['meta'] | null>(
    null
  );

  const fetchOrders = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getOrders(filters);
      setOrders(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to fetch orders';
      setError(errorMessage);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, enabled]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    meta,
    refetch: fetchOrders,
  };
}
