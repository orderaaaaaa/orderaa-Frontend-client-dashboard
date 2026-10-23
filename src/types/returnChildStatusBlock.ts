export const RETURN_CHILD_STATUS_BLOCKED = 'RETURN_CHILD_STATUS_BLOCKED' as const;

export interface ReturnChildStatusBlockedBody {
  statusCode: 409;
  code: typeof RETURN_CHILD_STATUS_BLOCKED;
  message: string;
  orders: { orderId: number; orderCode: string }[];
}
