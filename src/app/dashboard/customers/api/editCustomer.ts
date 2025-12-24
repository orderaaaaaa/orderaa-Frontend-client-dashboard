import http from '@/lib/api/http';
import {
  UpdateCustomerPayload,
  UpdateCustomerResponse,
} from '../types/updateCustomerPayload';

export async function editCustomer(
  customerId: number,
  payload: Omit<UpdateCustomerPayload, 'id'>
): Promise<UpdateCustomerResponse> {
  const { data } = await http.patch<UpdateCustomerResponse>(
    `/customers/${customerId}`,
    payload
  );
  return data;
}
