import api from './index';
import { Order, FilterOrdersDto, PaginatedResponse, FilterOptionsResponse, OrderStatisticsResponse } from '@/types/orders';

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

export async function getOrderById(id: number): Promise<Order> {
  try {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getFilterOptions(): Promise<FilterOptionsResponse> {
  try {
    const response = await api.get<FilterOptionsResponse>('/orders/filter-options');
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getOrderStatistics(): Promise<OrderStatisticsResponse> {
  try {
    const response = await api.get<OrderStatisticsResponse>('/orders/statistics');
    return response.data;
  } catch (error) {
    throw error;
  }
}

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

export async function getAllProducts(): Promise<any> {
  try {
    const response = await api.get('/orders/products');
    return response.data;
  } catch (error) {
    throw error;
  }
}

export interface ProductVariant {
  label: string;
  value: string;
}

export async function addOrderProduct(
  orderId: number,
  productId: number,
  variants: ProductVariant[],
  quantity: number,
  price: number
): Promise<any> {
  try {
    const response = await api.post(
      `/orders/${orderId}/products`,
      {
        productId,
        variants,
        quantity,
        price,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateCustomer(
  customerId: number,
  customerData: {
    name?: string;
    phoneNumbers?: string[];
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

export async function getNextOrderId(
  orderId: number,
  filters: Partial<FilterOrdersDto> = {}
): Promise<{ id: number }> {
  try {
    const { page, limit, ...rest } = filters;
    const response = await api.get<{ id: number }>(
      `/orders/${orderId}/next`,
      { params: rest }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export interface CancellationReason {
  id: number;
  reasonName: string;
  isActive: boolean;
  displayOrder: number;
  usageCount: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getCancellationReasons(): Promise<CancellationReason[]> {
  try {
    const response = await api.get<CancellationReason[]>('/cancellation-reasons');
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getTopCancellationReasons(): Promise<CancellationReason[]> {
  try {
    const response = await api.get<CancellationReason[]>('/cancellation-reasons/top');
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function cancelOrder(
  orderId: number,
  data: { cancelReasonId: number; notes?: string }
): Promise<Order> {
  try {
    const response = await api.post<Order>(`/orders/${orderId}/cancel`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function lockOrder(orderId: number): Promise<void> {
  try {
    await api.post(`/orders/${orderId}/lock`);
  } catch (error) {
    throw error;
  }
}

export async function unlockOrder(orderId: number): Promise<void> {
  try {
    await api.post(`/orders/${orderId}/unlock`);
  } catch (error) {
    throw error;
  }
}