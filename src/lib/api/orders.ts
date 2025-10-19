import api from '.';
import {
  FilterOrdersDto,
  PaginatedOrdersResponse,
  OrderDetailsResponse,
} from '@/types/orders';

/**
 * Fetch orders with optional filters and pagination
 * @param filters - Query parameters for filtering and pagination
 * @returns Paginated orders response
 */
export async function getOrders(
  filters?: FilterOrdersDto
): Promise<PaginatedOrdersResponse> {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }

  const queryString = params.toString();
  const url = `/orders/all-orders${queryString ? `?${queryString}` : ''}`;

  const { data } = await api.get<PaginatedOrdersResponse>(url);
  return data;
}

/**
 * Fetch a single order by ID
 * @param id - Order ID
 * @returns Order details response
 */
export async function getOrderById(
  id: number
): Promise<OrderDetailsResponse> {
  const { data } = await api.get<OrderDetailsResponse>(`/orders/${id}`);
  return data;
}

/**
 * Update order status
 * @param id - Order ID
 * @param status - New status
 */
export async function updateOrderStatus(id: number, status: string) {
  const { data } = await api.patch(`/orders/${id}/status`, { status });
  return data;
}

/**
 * Add note to order
 * @param id - Order ID
 * @param note - Note content
 */
export async function addOrderNote(id: number, note: string) {
  const { data } = await api.post(`/orders/${id}/notes`, { note });
  return data;
}
