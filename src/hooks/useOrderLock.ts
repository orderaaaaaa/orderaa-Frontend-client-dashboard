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
  const hasAttemptedLock = useRef(false);

  const currentEmployeeId = user?.employeeId;

  const isLockedByCurrentUser = lockedBy?.id === currentEmployeeId;
  const isLockedByOther = lockedBy !== null && lockedBy !== undefined && !isLockedByCurrentUser;

  useEffect(() => {
    if (!enabled || !orderId || hasAttemptedLock.current) return;

    if (lockedBy !== null && lockedBy !== undefined) {
      if (isLockedByCurrentUser) {
        setHasLock(true);
      }
      return;
    }

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
    if (!enabled || !orderId) return;

    return () => {
      if (hasLock || isLockedByCurrentUser) {
        unlockOrder(orderId).catch((error) => {
          console.error('Failed to unlock order on cleanup:', error);
        });
      }
    };
  }, [enabled, orderId, hasLock, isLockedByCurrentUser]);

  useEffect(() => {
    hasAttemptedLock.current = false;
    setHasLock(false);
    setLockError(null);
  }, [orderId]);

  return {
    isLockedByOther,
    lockedBy: lockedBy ?? null,
    isLocking,
    lockError,
    unlock,
  };
}
