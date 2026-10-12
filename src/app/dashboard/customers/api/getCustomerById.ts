import http from '@/lib/api/http';
import { CustomerDetail } from '../types/customer';

export async function getCustomer(id: number): Promise<CustomerDetail> {
  const { data } = await http.get<CustomerDetail>(`/customers/${id}`);
  return data;
}
