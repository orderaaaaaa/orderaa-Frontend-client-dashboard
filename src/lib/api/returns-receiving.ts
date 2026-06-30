import api from './index';
import type { ReturnOrder } from '@/app/dashboard/orders/returns-receiving/types/returns';

export async function getReturnOrderByCode(
  code: string,
): Promise<ReturnOrder> {
  const response = await api.get<ReturnOrder>(`/orders/by-code/${encodeURIComponent(code)}`);
  return response.data;
}

export interface SubmitReturnReceiptsRequest {
  orderCodes: string[];
  receiptImageUrl: string;
  codeSheetImageUrls?: string[];
}

export interface SubmitReturnReceiptsResponse {
  success: boolean;
  receiptId: number;
  receivedCount: number;
  receivedOrderCodes: string[];
}

export async function submitReturnReceipts(
  data: SubmitReturnReceiptsRequest,
): Promise<SubmitReturnReceiptsResponse> {
  const response = await api.post<SubmitReturnReceiptsResponse>(
    '/orders/return-receipts',
    data,
  );
  return response.data;
}
