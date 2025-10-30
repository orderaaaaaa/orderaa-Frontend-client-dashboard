import { ManualOrderPayload } from '@/types/manual-order';

// Replace with real HTTP client when endpoint is available
export async function createManualOrder(payload: ManualOrderPayload) {
  // Example placeholder to integrate later
  // return http.post('/api/orders/manual', payload);
  return Promise.resolve({ success: true, data: payload });
}


