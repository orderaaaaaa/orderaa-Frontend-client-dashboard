import http from '@/lib/api/http';
import { CustomerId } from '../types/customerId';
import { MergeCustomersPayload } from '../types/merge';

/**
 * `POST /customers/:customerId/merge` — target in the path, sources in the
 * body (identical shape to `POST /products/:productId/merge`). Returns the
 * merged customer in the same shape `GET /customers/:id` returns.
 */
export async function mergeCustomers(
  targetCustomerId: number,
  payload: MergeCustomersPayload
): Promise<CustomerId> {
  const { data } = await http.post<CustomerId>(
    `/customers/${targetCustomerId}/merge`,
    payload
  );
  return data;
}
