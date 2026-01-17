'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import {
  prepareOrders,
  waitingForPackaging,
  callAgainOrders,
} from '../services/printOrders';
import {
  PrepareOrdersRequest,
  PrepareOrdersResponse,
  WaitingForPackagingRequest,
  WaitingForPackagingResponse,
  CallAgainRequest,
  CallAgainResponse,
} from '../types';

export function usePrepareOrders() {
  const queryClient = useQueryClient();

  return useMutation<PrepareOrdersResponse, Error, PrepareOrdersRequest>({
    mutationFn: prepareOrders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRINT_ORDER_STATISTICS],
      });
    },
  });
}

export function useWaitingForPackaging() {
  const queryClient = useQueryClient();

  return useMutation<
    WaitingForPackagingResponse,
    Error,
    WaitingForPackagingRequest
  >({
    mutationFn: waitingForPackaging,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRINT_ORDER_STATISTICS],
      });
    },
  });
}

export function useCallAgainOrders() {
  const queryClient = useQueryClient();

  return useMutation<CallAgainResponse, Error, CallAgainRequest>({
    mutationFn: callAgainOrders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRINT_ORDER_STATISTICS],
      });
    },
  });
}
