import api from '@/lib/api';
import type {
  CreateCustomerReturnPayload,
  CreateCustomerReturnResponse,
  CustomerReturnCandidates,
} from '@/types/customer-return';

export async function getCustomerReturnCandidates(customerId: number) {
  const response = await api.get<CustomerReturnCandidates>('/orders/returns/candidates', {
    params: { customerId },
  });
  return response.data;
}

export async function createCustomerReturn(payload: CreateCustomerReturnPayload) {
  const response = await api.post<CreateCustomerReturnResponse>('/orders/returns', payload);
  return response.data;
}
