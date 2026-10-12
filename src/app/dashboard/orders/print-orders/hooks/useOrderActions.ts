'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidateAndWait, orderStatusKeys } from '@/lib/query/mutationSync';
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
    onSuccess: () => invalidateAndWait(queryClient, orderStatusKeys()),
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
    onSuccess: () => invalidateAndWait(queryClient, orderStatusKeys()),
  });
}

export function useCallAgainOrders() {
  const queryClient = useQueryClient();

  return useMutation<CallAgainResponse, Error, CallAgainRequest>({
    mutationFn: callAgainOrders,
    onSuccess: () => invalidateAndWait(queryClient, orderStatusKeys()),
  });
}
