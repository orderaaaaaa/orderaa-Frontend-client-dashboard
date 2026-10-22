import { OrderStatus } from '@/types/orders';

/**
 * Statuses the backend accepts for `POST /orders/return-receipts`.
 *
 * Mirrors `backend/src/orders/settlement/return-receipt-walk.ts`
 * (`SETTLEMENT_CARRIER_STAGE` = WAITING_FOR_APPROVAL / SHIPPING / WITH_DRIVER,
 * plus DELIVERED / RETURNED_DELIVERED / RETURNED_SETTLED). Keep in sync with it.
 */
export const RETURN_RECEIVABLE_STATUSES: readonly OrderStatus[] = [
  OrderStatus.WAITING_FOR_APPROVAL,
  OrderStatus.SHIPPING,
  OrderStatus.WITH_DRIVER,
  OrderStatus.DELIVERED,
  OrderStatus.RETURNED_DELIVERED,
  OrderStatus.RETURNED_SETTLED,
];

const RETURN_RECEIVABLE_STATUS_SET: ReadonlySet<string> = new Set(
  RETURN_RECEIVABLE_STATUSES,
);

/** `ReturnOrder.status` is `OrderStatus | string`, so narrow it at runtime. */
export function isReturnReceivableStatus(status: string): boolean {
  return RETURN_RECEIVABLE_STATUS_SET.has(status);
}
