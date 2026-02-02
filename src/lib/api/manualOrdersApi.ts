import api from '@/lib/api';
import { ManualOrderPayload } from '@/types/manual-order';

export async function createManualOrder(payload: ManualOrderPayload) {
  const response = await api.post('/orders', payload);
  return response.data;
}
