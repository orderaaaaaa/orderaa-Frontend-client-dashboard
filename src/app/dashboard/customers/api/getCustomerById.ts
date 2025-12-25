// api/getCustomer.ts
import http from '@/lib/api/http';
import { CustomerId } from '../types/customerId';

export async function getCustomer(id: number): Promise<CustomerId> {
  const { data } = await http.get<CustomerId>(`/customers/${id}`);
  return data;
}
