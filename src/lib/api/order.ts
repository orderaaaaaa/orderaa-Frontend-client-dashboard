import api from './index';
import { Order, FilterOrdersDto, PaginatedResponse } from '@/types/orders';

/**
 * Fetch orders with optional filters and pagination
 * @param filters - Filter options including status, search, page, and limit
 * @returns Paginated response with orders
 */
export async function getOrders(
  filters?: FilterOrdersDto
): Promise<PaginatedResponse<Order>> {
  try {
    const response = await api.get<PaginatedResponse<Order>>(
      '/orders/all-orders',
      {
        params: filters,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

/**
 * Fetch a single order by ID
 * @param id - Order ID
 * @returns Order details
 */
export async function getOrderById(id: number): Promise<Order> {
  try {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
}
