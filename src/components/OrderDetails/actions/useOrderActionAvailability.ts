import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSION_CODES, orderStatusSetCodeOf } from '@/lib/permissions';
import type { OrderStatus, OrderStatusItem } from '@/types/orders';
import {
  ORDER_ACTION_TARGET_STATUS,
  allowedShippingMoveTargets,
  orderActionAvailabilityOf,
  type OrderActionAvailability,
  type OrderActionAvailabilityInput,
  type OrderStatusActionKey,
} from './orderActionAvailability';

const READ_WINDOW_CHECKED_ACTIONS = new Set<OrderStatusActionKey>([
  'confirm',
  'urgent',
  'stopBar',
  'postpone',
  'waitingPayment',
  'rejectModification',
  'whatsapp',
]);

export interface UseOrderActionAvailabilityInput extends OrderActionAvailabilityInput {
  availableStatuses: OrderStatusItem[];
}

export function useOrderActionAvailability({
  availableStatuses,
  ...input
}: UseOrderActionAvailabilityInput): OrderActionAvailability & { shippingMoveTargets: OrderStatus[] } {
  const { hasPermission } = usePermissionCheck();
  const base = orderActionAvailabilityOf(input);
  const canUpdate = hasPermission(PERMISSION_CODES.ORDERS_UPDATE);
  const canCancel = hasPermission(PERMISSION_CODES.ORDERS_CANCEL);
  const shippingMoveTargets = base.shippingMove
    ? allowedShippingMoveTargets({
        status: input.status,
        isCustomerReturn: input.isCustomerReturn,
        has: hasPermission,
      })
    : [];

  const statusActionAllowed = (key: OrderStatusActionKey) => {
    const target = ORDER_ACTION_TARGET_STATUS[key];
    const setCode = orderStatusSetCodeOf(target);
    if (setCode === null || !hasPermission(setCode)) return false;
    if (READ_WINDOW_CHECKED_ACTIONS.has(key) && !availableStatuses.some((item) => item.key === target)) {
      return false;
    }
    if (key === 'cancel') return canCancel;
    return canUpdate;
  };

  const gated = (key: OrderStatusActionKey) => base[key] && statusActionAllowed(key);

  return {
    ...base,
    confirm: gated('confirm'),
    followUp: base.followUp && statusActionAllowed('followUp'),
    urgent: gated('urgent'),
    rejectModification: gated('rejectModification'),
    postpone: gated('postpone'),
    whatsapp: gated('whatsapp'),
    waitingPayment: gated('waitingPayment'),
    cancel: gated('cancel'),
    stopBar: gated('stopBar'),
    returnRefund: base.returnRefund && canUpdate,
    shippingMove: shippingMoveTargets.length > 0,
    shippingMoveTargets,
  };
}
