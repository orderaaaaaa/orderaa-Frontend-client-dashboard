import http from '@/lib/api/http';
import { GetCustomersParams, PaginatedCustomers } from '../types/customer';

export async function getCustomers({
  page = 1,
  limit = 10,
  search,
  isBlocked,
  latestOrderStatus,
  badge,
  segment,
}: GetCustomersParams): Promise<PaginatedCustomers> {
  const params: GetCustomersParams = { page, limit };

  if (search !== undefined && search !== '') params.search = search;
  if (isBlocked !== undefined) params.isBlocked = isBlocked;
  if (latestOrderStatus !== undefined && latestOrderStatus !== '') {
    params.latestOrderStatus = latestOrderStatus;
  }
  if (badge !== undefined) params.badge = badge;
  if (segment !== undefined && segment !== 'all') params.segment = segment;

  const { data } = await http.get<PaginatedCustomers>('/customers', {
    params,
  });
  return data;
}
