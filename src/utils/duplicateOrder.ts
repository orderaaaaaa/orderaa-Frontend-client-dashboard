import type { Order } from '@/types/orders';

export function isDuplicateExcludedOrder(order: Pick<Order, 'status' | 'duplicateOfOrderId'>): boolean {
  return order.status === 'CANCELLED' && order.duplicateOfOrderId != null;
}
