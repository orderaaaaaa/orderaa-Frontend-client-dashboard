export const ORDER_LINE_EDIT_CONFLICT = {
  SEND_BACK_REQUIRED: 'ORDER_EDIT_REQUIRES_SEND_BACK',
  RETURN_REQUIRED: 'ORDER_EDIT_REQUIRES_RETURN',
} as const;

export type OrderLineEditConflictCode =
  (typeof ORDER_LINE_EDIT_CONFLICT)[keyof typeof ORDER_LINE_EDIT_CONFLICT];

export interface OrderLineEditConflictBody {
  statusCode: 409;
  code: OrderLineEditConflictCode;
  message: string;
}
