import http from '@/lib/api/http';
import {
  BulkRequest,
  BulkUpdateResponse,
  OrdersBatchRequest,
  OrdersBatchResponse,
} from '../types/Bulk';

export async function bulkOrders(
  payload: BulkRequest,
  currentStatus?: string
): Promise<BulkUpdateResponse> {
  const params = currentStatus ? { status: currentStatus } : {};
  const { data } = await http.patch<BulkUpdateResponse>(
    '/orders/bulk',
    payload,
    {
      params,
    }
  );

  return data;
}

export const updateOrdersBatch = async (
  payload: OrdersBatchRequest
): Promise<OrdersBatchResponse> => {
  const { data } = await http.patch<OrdersBatchResponse>(
    '/orders/batch',
    payload
  );

  return data;
};
