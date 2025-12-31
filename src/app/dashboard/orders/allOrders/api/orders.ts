import http from '@/lib/api/http';
import {
  BulkRequest,
  BulkUpdateResponse,
  OrdersBatchRequest,
  OrdersBatchResponse,
} from '../types/Bulk';

export async function bulkOrders(
  payload: BulkRequest
): Promise<BulkUpdateResponse> {
  const { data } = await http.post<BulkUpdateResponse>('/orders/bulk', payload);

  return data;
}

export const updateOrdersBatch = async (
  payload: OrdersBatchRequest
): Promise<OrdersBatchResponse> => {
  const { data } = await http.post<OrdersBatchResponse>(
    '/orders/batch',
    payload
  );

  return data;
};
