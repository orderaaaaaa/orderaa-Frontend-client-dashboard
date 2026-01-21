import http from '@/lib/api/http';
import { Order } from '@/types/orders';

export interface SubmitForApprovalRequest {
  orderIds: number[];
}

export interface SubmitForApprovalResponse {
  success: boolean;
  message: string;
}

export async function getOrderByCodeWithShipping(
  code: string,
  shippingCompanyKey: string
): Promise<Order> {
  const response = await http.get<Order>(`/orders/by-code/${code}`, {
    params: { shippingCompany: shippingCompanyKey },
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
