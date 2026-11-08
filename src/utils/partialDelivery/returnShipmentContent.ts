import type { OrderProduct } from '@/types/orders';

export const RETURN_SHIPMENT_CONTENT_MAX_LENGTH = 1000;

export const isBlankReturnShipmentContent = (value: string | null | undefined): boolean =>
  value == null || value.trim() === '';

export const variantLabelOf = (op: OrderProduct) => {
  const attrs = (op.attributes ?? []).filter(
    (a) => a?.name && a?.options?.name,
  );
  return attrs.length > 0
    ? attrs.map((a) => `${a.name}: ${a.options.name}`).join(' • ')
    : (op.products.extraDetails?.variants ?? [])
        .map((v) => v.title)
        .join(' • ');
};

const unitContentLabelOf = (unit: OrderProduct) => {
  const label = variantLabelOf(unit);
  return label ? `${unit.products.name} (${label})` : unit.products.name;
};

export const returnShipmentContentOf = (refusedUnits: OrderProduct[]): string => {
  const countByLabel = new Map<string, number>();
  refusedUnits.forEach((unit) => {
    const label = unitContentLabelOf(unit);
    countByLabel.set(label, (countByLabel.get(label) ?? 0) + 1);
  });
  return Array.from(countByLabel, ([label, count]) => (count > 1 ? `${label} × ${count}` : label)).join('، ');
};
