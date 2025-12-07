import api from './index';
import { Order, OrderStatus, FilterOrdersDto, PaginatedResponse, FilterOptionsResponse, OrderStatisticsResponse, OrderStatusesResponse } from '@/types/orders';

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

/**
 * Update order product variant (size and color)
 * @param orderProductId - Order product ID
 * @param variant - Variant string (e.g., "37 - اسود")
 * @returns Updated order product
 */
export async function updateOrderProduct(
  orderProductId: number,
  variant: string
): Promise<any> {
  try {
    const response = await api.patch(
      `/orders/order-product/${orderProductId}`,
      { variant }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete an order product
 * @param orderProductId - Order product ID
 * @returns Deletion confirmation
 */
export async function deleteOrderProduct(
  orderProductId: number
): Promise<any> {
  try {
    const response = await api.delete(
      `/orders/order-product/${orderProductId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get all products
 * @returns List of all products
 */
export async function getAllProducts(): Promise<any> {
  try {
    const response = await api.get('/orders/products');
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Add a product to an order
 * @param orderId - Order ID
 * @param productId - Product ID
 * @param variant - Variant string (e.g., "37 - اسود")
 * @param quantity - Quantity
 * @param price - Price
 * @returns Added order product
 */
export async function addOrderProduct(
  orderId: number,
  productId: number,
  variant: string,
  quantity: number,
  price: number
): Promise<any> {
  try {
    const response = await api.post(
      `/orders/${orderId}/products`,
      {
        productId,
        variant,
        quantity,
        price,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Update customer information
 * @param customerId - Customer ID
 * @param customerData - Updated customer data
 * @returns Updated customer
 */
export async function updateCustomer(
  customerId: number,
  customerData: {
    name?: string;
    phoneNumber?: string;
    altPhone?: string;
    governorate?: string;
    city?: string;
    address?: string;
  }
): Promise<any> {
  try {
    const response = await api.patch(
      `/customers/${customerId}`,
      customerData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch order statuses
 * @returns List of order statuses with labels
 */
export async function getOrderStatuses(): Promise<OrderStatusesResponse> {
  try {
    const response = await api.get<OrderStatusesResponse>('/orders/statuses');
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Update order details (PATCH)
 * @param orderId - Order ID
 * @param orderData - Partial order data to update (only send fields that changed)
 * @returns Updated order
 */
export async function updateOrder(
  orderId: number,
  orderData: Partial<Order> | Record<string, any>
): Promise<Order> {
  try {
    const response = await api.patch<Order>(`/orders/${orderId}`, orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get next order ID based on status and date range
 * @param orderId - Current order ID
 * @param status - Order status filter
 * @param from - Start date (ISO format)
 * @param to - End date (ISO format)
 * @returns Next order ID
 */
export async function getNextOrderId(
  orderId: number,
  status?: OrderStatus,
  from?: string,
  to?: string
): Promise<{ orderId: number }> {
  try {
    const params: any = {};
    if (status) params.status = status;
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await api.get<{ orderId: number }>(
      `/orders/${orderId}/next`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}