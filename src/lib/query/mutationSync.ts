import { useCallback, useRef } from 'react';
import {
  partialMatchKey,
  useIsFetching,
  useQueryClient,
  type InvalidateQueryFilters,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';

export interface InvalidateAndWaitOptions {
  refetchType?: InvalidateQueryFilters['refetchType'];
}

export const invalidateAndWait = async (
  queryClient: QueryClient,
  keys: QueryKey[],
  options: InvalidateAndWaitOptions = {}
) => {
  await Promise.all(
    keys.map((queryKey) =>
      queryClient.invalidateQueries({
        queryKey,
        refetchType: options.refetchType,
      })
    )
  );
};

export const orderStatusKeys = (orderId?: number): QueryKey[] => [
  [QUERY_KEYS.ORDER_STATISTICS],
  [QUERY_KEYS.ORDERS],
  [QUERY_KEYS.PRINT_ORDER_STATISTICS],
  [QUERY_KEYS.CUSTOMER_ORDERS],
  orderId === undefined
    ? [QUERY_KEYS.ORDER_DETAILS]
    : [QUERY_KEYS.ORDER_DETAILS, orderId],
];

export function useOrderStatusSync() {
  const queryClient = useQueryClient();
  return useCallback(
    (extraKeys: QueryKey[] = [], options?: InvalidateAndWaitOptions) =>
      invalidateAndWait(
        queryClient,
        [...orderStatusKeys(), ...extraKeys],
        options
      ),
    [queryClient]
  );
}

export const readFreshQueryData = <T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  since: number,
  fallback: T
): T => {
  const state = queryClient.getQueryState<T>(queryKey);
  return state?.data !== undefined && state.dataUpdatedAt >= since
    ? state.data
    : fallback;
};

export type QueryCounterpart =
  | QueryKey
  | { queryKey: QueryKey; keyLength: number };

const matchesCounterpart = (
  queryKey: QueryKey,
  counterpart: QueryCounterpart
) =>
  Array.isArray(counterpart)
    ? partialMatchKey(queryKey, counterpart)
    : 'keyLength' in counterpart &&
      queryKey.length === counterpart.keyLength &&
      partialMatchKey(queryKey, counterpart.queryKey);

export function useHeldUntilSettled<T>(
  value: T,
  updatedAt: number,
  counterparts: QueryCounterpart[],
  scope?: unknown
): T {
  const pendingCounterparts = useIsFetching({
    predicate: (query) =>
      query.state.dataUpdatedAt < updatedAt &&
      counterparts.some((counterpart) =>
        matchesCounterpart(query.queryKey, counterpart)
      ),
  });
  const heldRef = useRef(value);
  const scopeRef = useRef(scope);
  if (
    pendingCounterparts === 0 ||
    heldRef.current === undefined ||
    !Object.is(scopeRef.current, scope)
  ) {
    heldRef.current = value;
    scopeRef.current = scope;
  }
  return heldRef.current;
}
