import { useEffect, useState, useCallback, useRef } from 'react';
import { isAxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/authStore';
import { lockOrder, unlockOrder } from '@/lib/api/order';
import { OrderLockedBy, LockOrderResponse, LockOrderSkippedResponse } from '@/types/orders';
import { PERMISSION_CODES } from '@/lib/generated/permission-codes';
import { hasPermissionCode } from '@/lib/permissions';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { getApiErrorMessage } from '@/utils/apiError';

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

const LOCK_REFUSAL_STATUSES = new Set([400, 409]);
const MAX_LOCK_ATTEMPTS = 2;

const isLockRefusal = (error: unknown) =>
  isAxiosError(error) &&
  error.response !== undefined &&
  LOCK_REFUSAL_STATUSES.has(error.response.status);

type LockPhase =
  | 'idle'
  | 'acquiring'
  | 'held'
  | 'refused'
  | 'skipped'
  | 'failed'
  | 'released';

interface LockState {
  orderId: number | null;
  phase: LockPhase;
  attempts: number;
  since: number;
}

interface UseOrderLockOptions {
  orderId: number | null;
  lockedBy: OrderLockedBy | null | undefined;
  lockedByUpdatedAt: number;
  enabled?: boolean;
}

interface UseOrderLockResult {
  isLockedByOther: boolean;
  lockedBy: OrderLockedBy | null;
  bypassedLockedBy: OrderLockedBy | null;
  isLocking: boolean;
  isLockPending: boolean;
  lockError: string | null;
  unlock: () => Promise<void>;
  forceUnlock: () => Promise<void>;
  isForceUnlocking: boolean;
}

export function useOrderLock({
  orderId,
  lockedBy,
  lockedByUpdatedAt,
  enabled = true,
}: UseOrderLockOptions): UseOrderLockResult {
  const [lock, setLock] = useState<LockState>({
    orderId: null,
    phase: 'idle',
    attempts: 0,
    since: 0,
  });
  const [lockError, setLockError] = useState<string | null>(null);
  const [isForceUnlocking, setIsForceUnlocking] = useState(false);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const arrivalRef = useRef<{ orderId: number | null; at: number }>({
    orderId: null,
    at: 0,
  });
  if (arrivalRef.current.orderId !== orderId) {
    arrivalRef.current = { orderId, at: Date.now() };
  }

  const hasLockRef = useRef(false);
  const mountedRef = useRef(true);
  const requestedRef = useRef<string | null>(null);
  const orderIdRef = useRef<number | null>(orderId);
  orderIdRef.current = orderId;

  const current: LockState =
    lock.orderId === orderId
      ? lock
      : { orderId, phase: 'idle', attempts: 0, since: arrivalRef.current.at };
  const { phase, attempts } = current;
  const freshSince =
    phase === 'refused' ? current.since : arrivalRef.current.at;
  const isFresh = lockedByUpdatedAt >= freshSince;
  const freshLockedBy = isFresh ? (lockedBy ?? null) : undefined;

  const currentEmployeeId = user?.employeeId;
  const freshLockedByOther =
    freshLockedBy !== undefined &&
    freshLockedBy !== null &&
    freshLockedBy.id !== currentEmployeeId;
  const canBypassLock = user?.permissions?.includes(PERMISSION_CODES.ORDERS_BYPASS_LOCK) === true;
  const canAcquireLock = hasPermissionCode(
    user?.permissions,
    PERMISSION_CODES.ORDERS_LOCK_ACQUIRE
  );

  const lockedByOther =
    phase !== 'held' && phase !== 'acquiring' && freshLockedByOther;
  const isLockedByOther = lockedByOther && !canBypassLock;
  const bypassedLockedBy =
    lockedByOther && canBypassLock ? (freshLockedBy ?? null) : null;

  const wantsAcquire =
    enabled &&
    orderId !== null &&
    canAcquireLock &&
    phase === 'idle' &&
    attempts < MAX_LOCK_ATTEMPTS &&
    !freshLockedByOther;

  const isLockPending =
    enabled &&
    orderId !== null &&
    canAcquireLock &&
    (wantsAcquire ||
      phase === 'acquiring' ||
      (phase === 'refused' && !isFresh));

  const hasLock = phase === 'held';

  useEffect(() => {
    hasLockRef.current = hasLock;
    if (hasLock && orderId) {
      activeLockedOrderId = orderId;
    } else if (!hasLock && activeLockedOrderId === orderId) {
      activeLockedOrderId = null;
    }
  }, [hasLock, orderId]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!wantsAcquire || orderId === null) return;

    const target = orderId;
    const attempt = attempts + 1;
    const requestKey = `${target}:${attempt}`;
    if (requestedRef.current === requestKey) return;
    requestedRef.current = requestKey;
    setLockError(null);
    setLock({ orderId: target, phase: 'acquiring', attempts: attempt, since: Date.now() });

    const isSuperseded = () =>
      !mountedRef.current || orderIdRef.current !== target;
    const settle = (next: LockPhase) =>
      setLock((state) =>
        state.orderId === target
          ? { ...state, phase: next, since: Date.now() }
          : state
      );

    lockOrder(target)
      .then((response) => {
        if (isSuperseded()) {
          if (!isLockSkipped(response)) {
            unlockOrder(target).catch((error) => {
              console.error('Failed to release a superseded lock:', error);
            });
          }
          return;
        }
        settle(isLockSkipped(response) ? 'skipped' : 'held');
      })
      .catch((error: unknown) => {
        if (isSuperseded()) return;
        if (isLockRefusal(error)) {
          settle('refused');
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.ORDER_DETAILS, target],
            exact: true,
          });
          return;
        }
        console.error('Failed to lock order:', error);
        setLockError(getApiErrorMessage(error, 'فشل في قفل الطلب'));
        settle('failed');
      });
  }, [wantsAcquire, orderId, attempts, queryClient]);

  useEffect(() => {
    if (phase !== 'refused' || !isFresh || freshLockedByOther) return;
    setLock((state) =>
      state.orderId === orderId && state.phase === 'refused'
        ? {
            ...state,
            phase: state.attempts < MAX_LOCK_ATTEMPTS ? 'idle' : 'failed',
            since: Date.now(),
          }
        : state
    );
  }, [phase, isFresh, freshLockedByOther, orderId]);

  const unlock = useCallback(async () => {
    if (!orderId || !hasLockRef.current) return;

    try {
      await unlockOrder(orderId);
      hasLockRef.current = false;
      setLock((state) =>
        state.orderId === orderId
          ? { ...state, phase: 'released', since: Date.now() }
          : state
      );
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
        if (response.previousLockedById === null) {
          toast.info('الطلب غير مقفل بالفعل، تم تحديث بيانات القفل');
        } else {
          toast.info('تغيّر حامل القفل، تم تحديث بيانات القفل');
        }
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
      const currentOrderId = orderId;
      const currentHasLock = hasLockRef.current;
      const alreadyUnlocked = activeLockedOrderId === null;

      activeLockedOrderId = null;
      hasLockRef.current = false;
      requestedRef.current = null;

      if (currentHasLock && currentOrderId && !alreadyUnlocked) {
        unlockOrder(currentOrderId).catch((error) => {
          console.error('Failed to unlock order on cleanup:', error);
        });
      }
    };
  }, [enabled, orderId]);

  return {
    isLockedByOther,
    lockedBy: lockedByOther ? (freshLockedBy ?? null) : null,
    bypassedLockedBy,
    isLocking: phase === 'acquiring',
    isLockPending,
    lockError,
    unlock,
    forceUnlock,
    isForceUnlocking,
  };
}
