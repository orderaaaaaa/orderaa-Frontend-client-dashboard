import { OrderStatus } from '@/types/orders';

export const STOP_OPERATION_STATUSES = new Set<string>([
  OrderStatus.CONFIRMED,
  OrderStatus.WAITING_FOR_PACKAGING,
  OrderStatus.PREPARED,
]);

export const POST_CONFIRMED_STATUSES = new Set<string>([
  OrderStatus.CONFIRMED,
  OrderStatus.WAITING_FOR_PACKAGING,
  OrderStatus.PREPARED,
  OrderStatus.WAITING_FOR_APPROVAL,
  OrderStatus.SHIPPING,
  OrderStatus.RETURNED_DELIVERED,
  OrderStatus.DELIVERED,
  OrderStatus.PARTIAL_DELIVERY,
  OrderStatus.MISSING,
]);
