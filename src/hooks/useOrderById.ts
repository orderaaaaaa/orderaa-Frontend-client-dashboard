import { useState, useEffect, useCallback } from 'react';
import { getOrderById } from '@/lib/api/orders';
import { Order } from '@/types/orders';

interface UseOrderByIdState {
  order: Order | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching a single order by ID
 * @param id - Order ID
 * @param enabled - Whether to fetch automatically
 */
export function useOrderById(
  id: number | null,
  enabled: boolean = true
): UseOrderByIdState {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!enabled || !id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getOrderById(id);
      setOrder(response.data);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to fetch order';
      setError(errorMessage);
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  }, [id, enabled]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
  };
}
