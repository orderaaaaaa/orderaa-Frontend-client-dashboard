import http from '@/lib/api/http';
import { CustomerBadgeCounts } from '../types/customer';

export async function getCustomerBadgeCounts(): Promise<CustomerBadgeCounts> {
  const { data } = await http.get<CustomerBadgeCounts>(
    '/customers/badge-counts'
  );
  return data;
}
