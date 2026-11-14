import {
  PERMISSION_CODES,
  orderStatusReadCodeOf,
  orderStatusSetCodeOf,
  type PermissionCode,
} from '@/lib/permissions';
import type { FollowupClosureKind } from '@/types/logistics';
import { OrderStatus } from '@/types/orders';
import { DELIVERED_STATUSES } from '@/types/shippingProviders';
import { STOP_OPERATION_STATUSES } from './constants';

export interface OrderActionAvailabilityInput {
  status: string;
  isCustomerReturn: boolean;
  frozen: boolean;
  actionable: boolean;
  lastEventStatus?: string;
}

export interface OrderActionAvailability {
  confirm: boolean;
  followUp: boolean;
  urgent: boolean;
  rejectModification: boolean;
  postpone: boolean;
  whatsapp: boolean;
  waitingPayment: boolean;
  cancel: boolean;
  stopBar: boolean;
  shippingMove: boolean;
  returnRefund: boolean;
  orderFieldsEditable: boolean;
  shippingEditable: boolean;
  productsEditable: boolean;
}

export type OrderStatusActionKey =
  | 'confirm'
  | 'urgent'
  | 'followUp'
  | 'rejectModification'
  | 'postpone'
  | 'whatsapp'
  | 'waitingPayment'
  | 'stopBar'
  | 'cancel';

export const ORDER_ACTION_TARGET_STATUS: Record<OrderStatusActionKey, OrderStatus> = {
  confirm: OrderStatus.CONFIRMED,
  urgent: OrderStatus.CONFIRMED,
  followUp: OrderStatus.ATTEMPTED,
  rejectModification: OrderStatus.EDIT_REJECTED,
  postpone: OrderStatus.POSTPONED,
  whatsapp: OrderStatus.WHATSAPP,
  waitingPayment: OrderStatus.WAITING_FOR_PAYMENT,
  stopBar: OrderStatus.STOPPED,
  cancel: OrderStatus.CANCELLED,
};

const PRE_STATUSES = new Set<string>([
  OrderStatus.NEW_ORDER,
  OrderStatus.WHATSAPP_CONFIRMED,
  OrderStatus.ATTEMPTED,
  OrderStatus.WAITING_FOR_PAYMENT,
  OrderStatus.WHATSAPP,
  OrderStatus.CALL_AGAIN,
  OrderStatus.EDIT_REJECTED,
  OrderStatus.POSTPONED,
  OrderStatus.STOPPED,
  OrderStatus.UNCOMPLETED,
]);

const SHIPPING_WINDOW_STATUSES: OrderStatus[] = [
  OrderStatus.WAITING_FOR_APPROVAL,
  OrderStatus.SHIPPING,
  OrderStatus.WITH_DRIVER,
];

const TRANSIT_STATUSES = new Set<string>(SHIPPING_WINDOW_STATUSES);

const DONE_STATUSES = new Set<string>([
  OrderStatus.DELIVERED,
  OrderStatus.RETURNED_DELIVERED,
  OrderStatus.RETURNED_COLLECTED,
  OrderStatus.COLLECTED,
  OrderStatus.RETURNED_SETTLED,
  OrderStatus.RETURNED_FINAL,
  OrderStatus.MISSING,
]);

const KNOWN_STATUSES = new Set<string>([
  ...PRE_STATUSES,
  OrderStatus.CANCELLED,
  ...STOP_OPERATION_STATUSES,
  ...TRANSIT_STATUSES,
  ...DONE_STATUSES,
]);

const CUSTOMER_RETURN_CANCEL_STATUSES = new Set<string>([
  OrderStatus.NEW_ORDER,
  OrderStatus.WAITING_FOR_APPROVAL,
  OrderStatus.SHIPPING,
  OrderStatus.WITH_DRIVER,
  OrderStatus.RETURNED_DELIVERED,
]);

const CUSTOMER_RETURN_SHIPPING_MOVE_TARGETS = new Map<string, OrderStatus[]>([
  [
    OrderStatus.WAITING_FOR_APPROVAL,
    [OrderStatus.SHIPPING, OrderStatus.WITH_DRIVER, OrderStatus.RETURNED_DELIVERED],
  ],
  [OrderStatus.SHIPPING, [OrderStatus.WITH_DRIVER, OrderStatus.RETURNED_DELIVERED]],
  [OrderStatus.WITH_DRIVER, [OrderStatus.RETURNED_DELIVERED]],
]);

const SHIPPING_MOVE_END_STATUSES: OrderStatus[] = [OrderStatus.DELIVERED, OrderStatus.RETURNED_DELIVERED];

export const shippingMoveTargetsOf = (status: string, isCustomerReturn: boolean): OrderStatus[] => {
  if (isCustomerReturn) return CUSTOMER_RETURN_SHIPPING_MOVE_TARGETS.get(status) ?? [];
  if (!TRANSIT_STATUSES.has(status)) return [];
  return [
    ...SHIPPING_WINDOW_STATUSES.filter((windowStatus) => windowStatus !== status),
    ...SHIPPING_MOVE_END_STATUSES,
  ];
};

export const allowedShippingMoveTargets = ({
  status,
  isCustomerReturn,
  closureKind,
  has,
}: {
  status: string;
  isCustomerReturn: boolean;
  closureKind?: FollowupClosureKind | null;
  has: (code: PermissionCode) => boolean;
}): OrderStatus[] => {
  const readCode = orderStatusReadCodeOf(status);
  if (readCode === null || !has(PERMISSION_CODES.ORDERS_UPDATE) || !has(readCode)) return [];
  const parcelReturning = closureKind === 'REFUSE' || closureKind === 'CANCEL';
  return shippingMoveTargetsOf(status, isCustomerReturn)
    .filter((target) => !parcelReturning || target === OrderStatus.RETURNED_DELIVERED)
    .filter((target) => {
      const setCode = orderStatusSetCodeOf(target);
      return setCode !== null && has(setCode);
    });
};

const SAME_TARGET_ALLOWED = new Set<string>([OrderStatus.ATTEMPTED, OrderStatus.EDIT_REJECTED]);

const RETURN_REFUND_STATUSES = new Set<string>(DELIVERED_STATUSES);

const NO_ACTIONS: OrderActionAvailability = {
  confirm: false,
  followUp: false,
  urgent: false,
  rejectModification: false,
  postpone: false,
  whatsapp: false,
  waitingPayment: false,
  cancel: false,
  stopBar: false,
  shippingMove: false,
  returnRefund: false,
  orderFieldsEditable: false,
  shippingEditable: false,
  productsEditable: false,
};

const repeatsCurrentStatus = (status: string, key: OrderStatusActionKey) => {
  const target: string = ORDER_ACTION_TARGET_STATUS[key];
  return target === status && !SAME_TARGET_ALLOWED.has(target);
};

const normalOrderAvailability = (
  status: string,
  lastEventStatus: string | undefined,
  returnRefund: boolean
): OrderActionAvailability => {
  const isPre = PRE_STATUSES.has(status);
  const isCallAgain = status === OrderStatus.CALL_AGAIN;
  const isCancelled = status === OrderStatus.CANCELLED;
  const isTransit = TRANSIT_STATUSES.has(status);
  const isProcessing = STOP_OPERATION_STATUSES.has(status);
  const isPreOrCancelled = isPre || isCancelled;

  const actionAvailable = (key: OrderStatusActionKey, allowed: boolean) =>
    allowed && !repeatsCurrentStatus(status, key);

  return {
    confirm: actionAvailable('confirm', isPreOrCancelled),
    followUp: actionAvailable('followUp', isPre),
    urgent: actionAvailable('urgent', isPre),
    rejectModification: actionAvailable('rejectModification', isPre),
    postpone: actionAvailable('postpone', isPre && !isCallAgain),
    whatsapp: actionAvailable('whatsapp', isPre && !isCallAgain),
    waitingPayment: actionAvailable(
      'waitingPayment',
      isPre && !isCallAgain && lastEventStatus !== OrderStatus.WAITING_FOR_PAYMENT
    ),
    cancel: actionAvailable('cancel', isPre || isTransit),
    stopBar: actionAvailable('stopBar', isProcessing),
    shippingMove: isTransit,
    returnRefund,
    orderFieldsEditable: isPreOrCancelled || isProcessing || isTransit,
    shippingEditable: isPreOrCancelled || isProcessing || isTransit,
    productsEditable: isPreOrCancelled || isProcessing,
  };
};

const customerReturnAvailability = (status: string, returnRefund: boolean): OrderActionAvailability => {
  const isNewOrder = status === OrderStatus.NEW_ORDER;
  return {
    ...NO_ACTIONS,
    confirm: isNewOrder,
    cancel: CUSTOMER_RETURN_CANCEL_STATUSES.has(status),
    shippingMove: CUSTOMER_RETURN_SHIPPING_MOVE_TARGETS.has(status),
    returnRefund,
    orderFieldsEditable: isNewOrder,
    shippingEditable: isNewOrder,
  };
};

export function orderActionAvailabilityOf({
  status,
  isCustomerReturn,
  frozen,
  actionable,
  lastEventStatus,
}: OrderActionAvailabilityInput): OrderActionAvailability {
  if (!KNOWN_STATUSES.has(status) || !actionable) return NO_ACTIONS;
  const returnRefund = RETURN_REFUND_STATUSES.has(status);
  if (frozen) return { ...NO_ACTIONS, returnRefund };
  if (isCustomerReturn) return customerReturnAvailability(status, returnRefund);
  return normalOrderAvailability(status, lastEventStatus, returnRefund);
}
