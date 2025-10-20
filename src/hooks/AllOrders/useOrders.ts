import { useState, useEffect } from 'react';
import { fetchOrders, FetchOrdersParams, fetchOrderStats } from '@/lib/api/order';
import { Order, OrderStatus, PaginatedResponse } from '@/types/orders';

export function useOrders(params?: FetchOrdersParams) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: PaginatedResponse<Order> = await fetchOrders(params);
        setOrders(response.data);
        setPagination(response.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [params?.page, params?.limit, params?.status, params?.search, params?.customerName, params?.phone, params?.governorate, params?.city, params?.productName]);

  return { orders, pagination, loading, error };
}

export function useOrderStats() {
  const [stats, setStats] = useState<Record<OrderStatus, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchOrderStats();
        setStats(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order stats');
        console.error('Error fetching order stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return { stats, loading, error };
}
