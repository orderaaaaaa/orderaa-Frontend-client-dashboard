import type { Order } from '@/types/orders';

export function lineProductNamesOf(order: Order): ReadonlyMap<number, string> {
  return new Map(
    (order.order_products ?? []).flatMap((line) =>
      line.products?.name ? [[line.id, line.products.name] as const] : [],
    ),
  );
}
