import http from '@/lib/api/http';
import { PaginatedCustomers } from '../types/customer';

export async function getCustomers(
  page = 1,
  limit = 10,
  search?: string,
  isBlocked?: boolean,
  latestOrderStatus?: string
): Promise<PaginatedCustomers> {
  const params: Record<string, any> = {
    page,
    limit,
  };

  if (search !== undefined && search !== '') {
    params.search = search;
  }
  if (isBlocked !== undefined) {
    params.isBlocked = isBlocked;
  }
  if (latestOrderStatus !== undefined && latestOrderStatus !== '') {
    params.latestOrderStatus = latestOrderStatus;
  }

  const { data } = await http.get<PaginatedCustomers>('/customers', {
    params,
  });
  return data;
}
