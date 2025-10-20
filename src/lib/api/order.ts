import api from '.';
import { Order, OrderStatus, PaginatedResponse, PaginationParams } from '@/types/orders';

export interface FetchOrdersParams extends PaginationParams {
  status?: OrderStatus;
  search?: string;
  customerName?: string;
  phone?: string;
  governorate?: string;
  city?: string;
  productName?: string;
}

/**
 * Fetch orders with optional filtering and pagination
 */
export async function fetchOrders(params?: FetchOrdersParams): Promise<PaginatedResponse<Order>> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.customerName) queryParams.append('customerName', params.customerName);
  if (params?.phone) queryParams.append('phone', params.phone);
  if (params?.governorate) queryParams.append('governorate', params.governorate);
  if (params?.city) queryParams.append('city', params.city);
  if (params?.productName) queryParams.append('productName', params.productName);

  const { data } = await api.get(`/orders?${queryParams.toString()}`);
  return data;
}

/**
 * Fetch a single order by ID
 */
export async function fetchOrderById(id: number): Promise<Order> {
  const { data } = await api.get(`/orders/${id}`);
  return data;
}

/**
 * Fetch orders by status with pagination
 */
export async function fetchOrdersByStatus(
  status: OrderStatus,
  params?: PaginationParams
): Promise<PaginatedResponse<Order>> {
  return fetchOrders({ ...params, status });
}

/**
 * Get order statistics/counts by status
 */
export async function fetchOrderStats(): Promise<Record<OrderStatus, number>> {
  const { data } = await api.get('/orders/stats');
  return data;
}

/**
 * Update order status
 */
export async function updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  const { data } = await api.patch(`/orders/${id}/status`, { status });
  return data;
}

/**
 * Search orders globally
 */
export async function searchOrders(
  searchTerm: string,
  params?: PaginationParams
): Promise<PaginatedResponse<Order>> {
  return fetchOrders({ ...params, search: searchTerm });
}
