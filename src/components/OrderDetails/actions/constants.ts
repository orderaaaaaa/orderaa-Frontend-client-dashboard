import { OrderStatus } from '@/types/orders';

export const POST_CONFIRMED_STATUSES = new Set<string>([
  OrderStatus.CONFIRMED,
  'WAITING_FOR_PACKAGING',
  OrderStatus.PREPARED,
  'WAITING_FOR_APPROVAL',
  OrderStatus.SHIPPING,
  OrderStatus.RETURNED_DELIVERED,
  OrderStatus.DELIVERED,
  OrderStatus.PARTIAL_DELIVERY,
  OrderStatus.MISSING,
]);
