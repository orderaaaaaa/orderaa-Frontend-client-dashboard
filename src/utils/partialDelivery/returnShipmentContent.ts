import type { OrderProduct } from '@/types/orders';

export const RETURN_SHIPMENT_CONTENT_MAX_LENGTH = 255;

export const returnShipmentContentOf = (remainingUnits: OrderProduct[]): string => {
  const countByName = new Map<string, number>();
  remainingUnits.forEach((unit) => {
    const name = unit.products.name;
    countByName.set(name, (countByName.get(name) ?? 0) + 1);
  });
  const content = Array.from(countByName, ([name, count]) => (count > 1 ? `${name} × ${count}` : name)).join('، ');
  return content.slice(0, RETURN_SHIPMENT_CONTENT_MAX_LENGTH);
};
