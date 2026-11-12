import type { OrderActionAvailability } from './orderActionAvailability';

export type OrderMenuAction =
  | 'urgent'
  | 'cancel'
  | 'reject_modification'
  | 'postpone_hours'
  | 'postpone_days'
  | 'whatsapp'
  | 'partial_delivery'
  | 'undo_partial_delivery'
  | 'waiting_payment'
  | 'return_refund';

export interface OrderMenuItemsInput {
  availability: OrderActionAvailability;
  partialVisible: boolean;
  undoVisible: boolean;
}

export function orderMenuItemsOf({
  availability,
  partialVisible,
  undoVisible,
}: OrderMenuItemsInput): OrderMenuAction[] {
  const items: OrderMenuAction[] = [];
  if (availability.urgent) items.push('urgent');
  if (availability.cancel) items.push('cancel');
  if (availability.rejectModification) items.push('reject_modification');
  if (availability.postpone) items.push('postpone_hours', 'postpone_days');
  if (availability.whatsapp) items.push('whatsapp');
  if (partialVisible) items.push('partial_delivery');
  if (undoVisible) items.push('undo_partial_delivery');
  if (availability.waitingPayment) items.push('waiting_payment');
  if (availability.returnRefund) items.push('return_refund');
  return items;
}
