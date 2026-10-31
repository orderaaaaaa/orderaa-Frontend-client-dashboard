import { ORDER_STATUS_ARABIC_LABELS } from '@/app/dashboard/constants/statusMappings';
import { ACTION_EVENT_NAME_LABELS } from '@/constants/followupEventLabels';

export const ORDER_EVENT_LABELS = {
  SHIPPING_COMPANY_CHANGED: 'تغيير شركة الشحن',
  EXCHANGE: 'استبدال',
} as const;

export type OrderEventLabelKey = keyof typeof ORDER_EVENT_LABELS;

export function orderEventLabelOf(name: string): string | undefined {
  if (Object.prototype.hasOwnProperty.call(ORDER_EVENT_LABELS, name)) {
    return ORDER_EVENT_LABELS[name as OrderEventLabelKey];
  }
  if (Object.prototype.hasOwnProperty.call(ORDER_STATUS_ARABIC_LABELS, name)) return undefined;
  return Object.prototype.hasOwnProperty.call(ACTION_EVENT_NAME_LABELS, name)
    ? ACTION_EVENT_NAME_LABELS[name]
    : undefined;
}
