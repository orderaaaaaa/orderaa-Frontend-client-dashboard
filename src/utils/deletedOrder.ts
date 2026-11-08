import type { Order } from '@/types/orders';

export function isDeletedOrder(order: Pick<Order, 'deletedAt'>): boolean {
  return order.deletedAt != null;
}
