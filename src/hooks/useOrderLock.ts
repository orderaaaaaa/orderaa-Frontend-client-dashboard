import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/authStore';
import { lockOrder, unlockOrder } from '@/lib/api/order';
import { OrderLockedBy, LockOrderResponse, LockOrderSkippedResponse } from '@/types/orders';
import { PERMISSION_CODES } from '@/lib/generated/permission-codes';
import { QUERY_KEYS } from '@/lib/api/queryKeys';

let activeLockedOrderId: number | null = null;

export async function unlockActiveOrder(): Promise<void> {
  const orderId = activeLockedOrderId;
  if (!orderId) return;

  activeLockedOrderId = null;
  try {
    await unlockOrder(orderId);
  } catch (error) {
    console.error('Failed to unlock order before logout:', error);
  }
}

const isLockSkipped = (
  response: LockOrderResponse
): response is LockOrderSkippedResponse =>
  'skipped' in response && response.skipped === true;

interface UseOrderLockOptions {
  orderId: number | null;
  lockedBy: OrderLockedBy | null | undefined;
  enabled?: boolean;
}

interface UseOrderLockResult {
  isLockedByOther: boolean;
  lockedBy: OrderLockedBy | null;
  bypassedLockedBy: OrderLockedBy | null;
  isLocking: boolean;
  lockError: string | null;
  unlock: () => Promise<void>;
  forceUnlock: () => Promise<void>;
  isForceUnlocking: boolean;
}

export function useOrderLock({
  orderId,
  lockedBy,
  enabled = true,
}: UseOrderLockOptions): UseOrderLockResult {
  const [isLocking, setIsLocking] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);
  const [hasLock, setHasLock] = useState(false);
  const [isForceUnlocking, setIsForceUnlocking] = useState(false);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const hasLockRef = useRef(false);
  const orderIdRef = useRef<number | null>(null);
  const hasAttemptedLock = useRef(false);

  const currentEmployeeId = user?.employeeId;
  const isLockedByCurrentUser = lockedBy?.id === currentEmployeeId;
  const lockedByOther = lockedBy !== null && lockedBy !== undefined && !isLockedByCurrentUser;
  const canBypassLock = user?.permissions?.includes(PERMISSION_CODES.ORDERS_BYPASS_LOCK) === true;
  const isLockedByOther = lockedByOther && !canBypassLock;
  const bypassedLockedBy = lockedByOther && canBypassLock ? (lockedBy ?? null) : null;

  useEffect(() => {
    hasLockRef.current = hasLock;
    if (hasLock && orderId) {
      activeLockedOrderId = orderId;
    } else if (!hasLock) {
      activeLockedOrderId = null;
    }
  }, [hasLock, orderId]);

  useEffect(() => {
    orderIdRef.current = orderId;
  }, [orderId]);

  useEffect(() => {
    if (!enabled || !orderId) return;

    if (hasAttemptedLock.current && orderIdRef.current !== orderId) {
      hasAttemptedLock.current = false;
      setHasLock(false);
      setLockError(null);
    }

    if (lockedBy !== null && lockedBy !== undefined) {
      setHasLock(isLockedByCurrentUser);
      return;
    }

    if (hasAttemptedLock.current) return;

    const acquireLock = async () => {
      hasAttemptedLock.current = true;
      setIsLocking(true);
      setLockError(null);

      try {
        const response = await lockOrder(orderId);
        if (isLockSkipped(response)) return;
        setHasLock(true);
      } catch (error: any) {
        console.error('Failed to lock order:', error);
        setLockError(error?.response?.data?.message || 'فشل في قفل الطلب');
      } finally {
        setIsLocking(false);
      }
    };

    acquireLock();
  }, [enabled, orderId, lockedBy, isLockedByCurrentUser]);

  const unlock = useCallback(async () => {
    if (!orderId || !hasLockRef.current) return;

    try {
      await unlockOrder(orderId);
      setHasLock(false);
    } catch (error) {
      console.error('Failed to unlock order:', error);
    }
  }, [orderId]);

  const forceUnlock = useCallback(async () => {
    if (!orderId) return;

    setIsForceUnlocking(true);
    try {
      const response = await unlockOrder(orderId);
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDER_DETAILS, orderId],
      });
      if (response.released === false) {
        toast.info('تغيّر حامل القفل، تم تحديث بيانات القفل');
      } else {
        toast.success('تم فك قفل الطلب');
      }
    } finally {
      setIsForceUnlocking(false);
    }
  }, [orderId, queryClient]);

  useEffect(() => {
    if (!enabled) return;

    return () => {
      const currentOrderId = orderIdRef.current;
      const currentHasLock = hasLockRef.current;
      const alreadyUnlocked = activeLockedOrderId === null;

      activeLockedOrderId = null;

      if (currentHasLock && currentOrderId && !alreadyUnlocked) {
        unlockOrder(currentOrderId).catch((error) => {
          console.error('Failed to unlock order on cleanup:', error);
        });
      }

      hasAttemptedLock.current = false;
    };
  }, [enabled, orderId]);

  return {
    isLockedByOther,
    lockedBy: lockedBy ?? null,
    bypassedLockedBy,
    isLocking,
    lockError,
    unlock,
    forceUnlock,
    isForceUnlocking,
  };
}
