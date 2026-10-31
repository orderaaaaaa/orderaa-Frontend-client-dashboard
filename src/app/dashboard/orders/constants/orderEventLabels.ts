export const ORDER_EVENT_LABELS = {
  SHIPPING_COMPANY_CHANGED: 'تغيير شركة الشحن',
  EXCHANGE: 'استبدال',
} as const;

export type OrderEventLabelKey = keyof typeof ORDER_EVENT_LABELS;

export function orderEventLabelOf(name: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(ORDER_EVENT_LABELS, name)
    ? ORDER_EVENT_LABELS[name as OrderEventLabelKey]
    : undefined;
}
