import { OrderStatus } from '@/types/orders';

interface OrderWithWarnings {
  status: OrderStatus | string;
  isShadowed?: boolean;
  packagingWarning?: string | null;
  editRejectedNote?: string | null;
  cancelReason?: string | null;
}

/**
 * Statuses where a stale `packagingWarning` (only cleared on reprint) must not
 * block scanning — the order has already left packaging.
 */
const PACKAGING_WARNING_IGNORED_STATUSES: readonly string[] = [
  OrderStatus.SHIPPING,
  OrderStatus.WITH_DRIVER,
  OrderStatus.DELIVERED,
  OrderStatus.COLLECTED,
  OrderStatus.RETURNED_DELIVERED,
  OrderStatus.RETURNED_COLLECTED,
  OrderStatus.RETURNED_SETTLED,
  OrderStatus.RETURNED_FINAL,
  OrderStatus.MISSING,
];

/**
 * Returns the first warning message for a scanned order, or null if no warnings.
 * Priority: isShadowed > packagingWarning (when relevant) > editRejectedNote >
 * cancelReason (only while the order is still CANCELLED — it can be stale after
 * re-confirmation).
 */
export function getOrderWarning(order: OrderWithWarnings): string | null {
  if (order.isShadowed) {
    return 'الطلب محجوب Due to insufficient balance';
  }
  if (
    order.packagingWarning &&
    !PACKAGING_WARNING_IGNORED_STATUSES.includes(order.status)
  ) {
    return order.packagingWarning;
  }
  if (order.editRejectedNote) {
    return order.editRejectedNote;
  }
  if (order.cancelReason && order.status === OrderStatus.CANCELLED) {
    return order.cancelReason;
  }
  return null;
}
