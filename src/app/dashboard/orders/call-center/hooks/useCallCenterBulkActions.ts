'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import uniqBy from 'lodash/uniqBy';
import type { Order } from '@/types/orders';
import { OrderStatus } from '@/types/orders';
import { getApiErrorMessage } from '@/utils/apiError';
import { usePermissionCheck } from '@/hooks/usePermissions';
import type { OrderStatusSetCode } from '@/lib/permissions';
import {
  useCallAgainOrders,
  usePrepareOrders,
  useWaitingForPackaging,
} from '../../print-orders/hooks/useOrderActions';
import {
  formatOrderCodes,
  splitParkedOrders,
  warnParkedOrdersSkipped,
} from '../../allOrders/utils/bulkStatusFeedback';

export type CallCenterBulkAction =
  | 'prepare'
  | 'waitingForPackaging'
  | 'callAgain'
  | 'changeProduct';

interface ActionRule {
  label: string;
  setStatusCode: OrderStatusSetCode;
  allowedFrom: ReadonlySet<string> | null;
}

const ACTION_RULES: Record<CallCenterBulkAction, ActionRule> = {
  prepare: {
    label: 'تم التحضير',
    setStatusCode: 'orders:setStatus:PREPARED',
    allowedFrom: new Set<string>([
      OrderStatus.CONFIRMED,
      OrderStatus.WAITING_FOR_PACKAGING,
      OrderStatus.CALL_AGAIN,
    ]),
  },
  waitingForPackaging: {
    label: 'في انتظار التغليف',
    setStatusCode: 'orders:setStatus:WAITING_FOR_PACKAGING',
    allowedFrom: new Set<string>([OrderStatus.CONFIRMED]),
  },
  callAgain: {
    label: 'اعادة اتصال',
    setStatusCode: 'orders:setStatus:CALL_AGAIN',
    allowedFrom: null,
  },
  changeProduct: {
    label: 'تغيير المنتج',
    setStatusCode: 'orders:setStatus:CALL_AGAIN',
    allowedFrom: null,
  },
};

export function splitOrdersForAction(
  action: CallCenterBulkAction,
  orders: Order[]
) {
  const { allowedFrom } = ACTION_RULES[action];
  const { actionable, parked } = splitParkedOrders(uniqBy(orders, 'id'));
  const eligible = actionable.filter(
    (order) => !allowedFrom || allowedFrom.has(order.status)
  );
  const wrongStatus = actionable.filter(
    (order) => allowedFrom !== null && !allowedFrom.has(order.status)
  );
  return { eligible, parked, wrongStatus };
}

export function warnSkippedForAction(
  action: CallCenterBulkAction,
  parked: Order[],
  wrongStatus: Order[],
  offPageCount = 0
) {
  if (offPageCount > 0) {
    toast.warning(
      `تم استبعاد ${offPageCount} طلب محدد من صفحات أخرى. الإجراء يطبّق على طلبات الصفحة الحالية فقط`
    );
  }
  warnParkedOrdersSkipped(parked);
  if (wrongStatus.length > 0) {
    toast.warning(
      `تم استبعاد ${wrongStatus.length} طلب لأن حالتها لا تسمح بـ «${ACTION_RULES[action].label}»: ${formatOrderCodes(wrongStatus)}`
    );
  }
}

interface UseCallCenterBulkActionsOptions {
  onCompleted: () => void;
}

export function useCallCenterBulkActions({
  onCompleted,
}: UseCallCenterBulkActionsOptions) {
  const { hasPermission } = usePermissionCheck();
  const { mutateAsync: prepareOrders } = usePrepareOrders();
  const { mutateAsync: waitForPackaging } = useWaitingForPackaging();
  const { mutateAsync: callAgainOrders } = useCallAgainOrders();
  const pendingRef = useRef(false);
  const [isPending, setIsPending] = useState(false);

  const run = useCallback(
    async (
      action: CallCenterBulkAction,
      request: () => Promise<number>
    ): Promise<boolean> => {
      if (pendingRef.current) return false;
      pendingRef.current = true;
      setIsPending(true);
      try {
        const updatedCount = await request();
        toast.success(
          `تم تحديث ${updatedCount} طلب إلى ${ACTION_RULES[action].label}`
        );
        onCompleted();
        return true;
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'فشل تحديث الطلبات'));
        return false;
      } finally {
        pendingRef.current = false;
        setIsPending(false);
      }
    },
    [onCompleted]
  );

  const canSetTarget = useCallback(
    (action: CallCenterBulkAction) => {
      const { setStatusCode, label } = ACTION_RULES[action];
      if (hasPermission(setStatusCode)) return true;
      toast.error(`ليس لديك صلاحية نقل الطلبات إلى «${label}»`);
      return false;
    },
    [hasPermission]
  );

  const runForOrders = useCallback(
    (
      action: Exclude<CallCenterBulkAction, 'changeProduct'>,
      orders: Order[],
      offPageCount: number
    ) => {
      if (pendingRef.current) return Promise.resolve(false);
      if (!canSetTarget(action)) return Promise.resolve(false);
      const { eligible, parked, wrongStatus } = splitOrdersForAction(
        action,
        orders
      );
      warnSkippedForAction(action, parked, wrongStatus, offPageCount);
      if (eligible.length === 0) return Promise.resolve(false);

      if (action === 'prepare') {
        return run(action, async () => {
          const result = await prepareOrders({
            orderCodes: eligible.map((order) => order.code),
          });
          return result.preparedCount;
        });
      }
      if (action === 'waitingForPackaging') {
        return run(action, async () => {
          const result = await waitForPackaging({
            orderIds: eligible.map((order) => order.id),
          });
          return result.movedCount;
        });
      }
      return run(action, async () => {
        const result = await callAgainOrders({
          orders: eligible.map((order) => ({ id: order.id })),
        });
        return result.movedCount;
      });
    },
    [run, canSetTarget, prepareOrders, waitForPackaging, callAgainOrders]
  );

  const changeProduct = useCallback(
    async (ordersWithNotes: { id: number; packagingNote: string }[]) => {
      const applied = await run('changeProduct', async () => {
        const result = await callAgainOrders({
          orders: uniqBy(ordersWithNotes, 'id'),
        });
        return result.movedCount;
      });
      if (!applied) {
        throw new Error('CHANGE_PRODUCT_FAILED');
      }
    },
    [run, callAgainOrders]
  );

  const prepare = useCallback(
    (orders: Order[], offPageCount: number) =>
      runForOrders('prepare', orders, offPageCount),
    [runForOrders]
  );
  const waitForPackagingOrders = useCallback(
    (orders: Order[], offPageCount: number) =>
      runForOrders('waitingForPackaging', orders, offPageCount),
    [runForOrders]
  );
  const callAgain = useCallback(
    (orders: Order[], offPageCount: number) =>
      runForOrders('callAgain', orders, offPageCount),
    [runForOrders]
  );

  return {
    isPending,
    canSetTarget,
    prepare,
    waitForPackaging: waitForPackagingOrders,
    callAgain,
    changeProduct,
  };
}
