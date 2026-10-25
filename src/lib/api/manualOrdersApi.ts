import api from '@/lib/api';
import { CreateOrderResponse, ManualOrderPayload } from '@/types/manual-order';

export async function createManualOrder(payload: ManualOrderPayload) {
  const response = await api.post<CreateOrderResponse>('/orders', payload);
  return response.data;
}
