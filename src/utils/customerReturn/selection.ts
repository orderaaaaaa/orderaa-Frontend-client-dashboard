import type {
  CustomerReturnSourceOrder,
  CustomerReturnUnit,
} from '@/types/customer-return';

export const selectableUnitIdsOf = (
  order: CustomerReturnSourceOrder,
): number[] =>
  order.units
    .filter((unit) => unit.state === 'SELECTABLE')
    .map((unit) => unit.orderProductId);

export const selectedUnitsOf = (
  orders: CustomerReturnSourceOrder[],
  selectedIds: ReadonlySet<number>,
): CustomerReturnUnit[] =>
  orders.flatMap((order) =>
    order.units.filter(
      (unit) =>
        unit.state === 'SELECTABLE' && selectedIds.has(unit.orderProductId),
    ),
  );

export const refundValueOf = (units: CustomerReturnUnit[]): number =>
  Math.round(units.reduce((total, unit) => total + unit.price, 0) * 100) / 100;

const RETURN_PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;

export const returnPriceOf = (text: string): number | null => {
  const trimmed = text.trim();
  return RETURN_PRICE_PATTERN.test(trimmed) ? Number(trimmed) : null;
};
