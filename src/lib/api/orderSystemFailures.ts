import http from '@/lib/api/http';
import type { OrderSystemFailure } from '@/types/orderSystemFailures';

export async function retryHeldTransition(
  orderId: number,
  failureId: number
): Promise<OrderSystemFailure> {
  const { data } = await http.post<OrderSystemFailure>(
    `/orders/${orderId}/system-failures/${failureId}/retry-held-transition`
  );
  return data;
}
