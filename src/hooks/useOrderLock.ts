import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { lockOrder, unlockOrder } from '@/lib/api/order';
import { OrderLockedBy } from '@/types/orders';

interface UseOrderLockOptions {
  orderId: number | null;
  lockedBy: OrderLockedBy | null | undefined;
  enabled?: boolean;
}

interface UseOrderLockResult {
  isLockedByOther: boolean;
  lockedBy: OrderLockedBy | null;
  isLocking: boolean;
  lockError: string | null;
  unlock: () => Promise<void>;
}

export function useOrderLock({
  orderId,
  lockedBy,
  enabled = true,
}: UseOrderLockOptions): UseOrderLockResult {
  const [isLocking, setIsLocking] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);
  const [hasLock, setHasLock] = useState(false);
  const user = useAuthStore((state) => state.user);

  const hasLockRef = useRef(false);
  const orderIdRef = useRef<number | null>(null);
  const hasAttemptedLock = useRef(false);

  const currentEmployeeId = user?.employeeId;
  const isLockedByCurrentUser = lockedBy?.id === currentEmployeeId;
  const isLockedByOther = lockedBy !== null && lockedBy !== undefined && !isLockedByCurrentUser;

  useEffect(() => {
    hasLockRef.current = hasLock;
  }, [hasLock]);

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
      if (isLockedByCurrentUser) {
        setHasLock(true);
      }
      return;
    }

    if (hasAttemptedLock.current) return;

    const acquireLock = async () => {
      hasAttemptedLock.current = true;
      setIsLocking(true);
      setLockError(null);

      try {
        await lockOrder(orderId);
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
    if (!orderId || isLockedByOther) return;

    try {
      await unlockOrder(orderId);
      setHasLock(false);
    } catch (error) {
      console.error('Failed to unlock order:', error);
    }
  }, [orderId, isLockedByOther]);

  useEffect(() => {
    if (!enabled) return;

    return () => {
      const currentOrderId = orderIdRef.current;
      const currentHasLock = hasLockRef.current;

      if (currentHasLock && currentOrderId) {
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
    isLocking,
    lockError,
    unlock,
  };
}
