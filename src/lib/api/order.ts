import api from './index';
import { Order, FilterOrdersDto, PaginatedResponse, FilterOptionsResponse, OrderStatisticsResponse } from '@/types/orders';

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
    throw error;
  }
}

/**
 * Fetch dynamic filter options from backend
 * @returns Filter options (governorates, cities, areas, products, etc.)
 */
export async function getFilterOptions(): Promise<FilterOptionsResponse> {
  try {
    const response = await api.get<FilterOptionsResponse>('/orders/filter-options');
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch order statistics
 * @returns Statistics (total orders, status counts, revenue, etc.)
 */
export async function getOrderStatistics(): Promise<OrderStatisticsResponse> {
  try {
    const response = await api.get<OrderStatisticsResponse>('/orders/statistics');
    return response.data;
  } catch (error) {
    throw error;
  }
}
