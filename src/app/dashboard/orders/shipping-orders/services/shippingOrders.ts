import http from '@/lib/api/http';
import { Order } from '@/types/orders';

export interface SubmitForApprovalRequest {
  orderIds: number[];
}

export interface SubmitForApprovalResponse {
  success: boolean;
  submittedCount: number;
  submittedOrderIds: number[];
  pickupCode: string;
}

export async function getOrderByCodeWithShipping(
  code: string,
  shippingCompanyId: string
): Promise<Order> {
  const response = await http.get<Order>(`/orders/by-code/${code}`, {
    params: { shippingCompanyId },
  });
  return response.data;
}

export async function submitForApproval(
  payload: SubmitForApprovalRequest
): Promise<SubmitForApprovalResponse> {
  const response = await http.post<SubmitForApprovalResponse>(
    '/orders/submit-for-approval',
    payload
  );
  return response.data;
}
