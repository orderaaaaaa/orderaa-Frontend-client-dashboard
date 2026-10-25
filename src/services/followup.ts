import { useMutation, useQuery, useQueryClient, keepPreviousData, type QueryKey } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import {
  getFollowupNewOrders,
  getFollowupOverdue,
  getFollowupExecuted,
  recordFollowupEventPoint,
  markFollowupAttempted,
  markFollowupPostponed,
  markFollowupChangeProducts,
  markFollowupSendAgain,
  markFollowupClosed,
  markFollowupRefused,
  markFollowupCancelled,
  markFollowupOverdue,
  undoFollowupClosure,
  type FollowupChangeProductInput,
  type FollowupReasonBody,
} from '@/lib/api/followup';
import type { FollowupFilters, ShippingPointType } from '@/types/logistics';

export const useFollowupNewOrdersQuery = (filters: FollowupFilters = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FOLLOWUP_NEW_ORDERS, filters] as QueryKey,
    queryFn: () => getFollowupNewOrders(filters),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
};

export const useFollowupOverdueQuery = (filters: FollowupFilters = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FOLLOWUP_OVERDUE, filters] as QueryKey,
    queryFn: () => getFollowupOverdue(filters),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
};

export const useFollowupExecutedQuery = (filters: FollowupFilters = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FOLLOWUP_EXECUTED, filters] as QueryKey,
    queryFn: () => getFollowupExecuted(filters),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
};

interface RecordEventPointVariables {
  orderId: number;
  eventId: number;
  pointType: ShippingPointType;
}

export const useRecordFollowupEventPointMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, eventId, pointType }: RecordEventPointVariables) =>
      recordFollowupEventPoint(orderId, eventId, pointType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLLOWUP_NEW_ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLLOWUP_OVERDUE] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLLOWUP_EXECUTED] });
    },
  });
};

function useFollowupListsInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLLOWUP_NEW_ORDERS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLLOWUP_OVERDUE] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLLOWUP_EXECUTED] });
  };
}

export const useFollowupAttemptedMutation = () => {
  const invalidate = useFollowupListsInvalidation();
  return useMutation({
    mutationFn: ({ orderId, note }: { orderId: number; note?: string }) =>
      markFollowupAttempted(orderId, note),
    onSuccess: invalidate,
  });
};

export const useFollowupPostponedMutation = () => {
  const invalidate = useFollowupListsInvalidation();
  return useMutation({
    mutationFn: ({ orderId, date }: { orderId: number; date: string }) =>
      markFollowupPostponed(orderId, date),
    onSuccess: invalidate,
  });
};

export const useFollowupChangeProductsMutation = () => {
  const invalidate = useFollowupListsInvalidation();
  return useMutation({
    mutationFn: ({ orderId, products }: { orderId: number; products: FollowupChangeProductInput[] }) =>
      markFollowupChangeProducts(orderId, products),
    onSuccess: invalidate,
  });
};

export const useFollowupSendAgainMutation = () => {
  const invalidate = useFollowupListsInvalidation();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: number; reason: string }) =>
      markFollowupSendAgain(orderId, reason),
    onSuccess: invalidate,
  });
};

export const useFollowupCloseMutation = () => {
  const invalidate = useFollowupListsInvalidation();
  return useMutation({
    mutationFn: ({ orderId }: { orderId: number }) => markFollowupClosed(orderId),
    onSuccess: invalidate,
  });
};

export const useFollowupRefuseMutation = () => {
  const invalidate = useFollowupListsInvalidation();
  return useMutation({
    mutationFn: ({ orderId, ...body }: { orderId: number } & FollowupReasonBody) =>
      markFollowupRefused(orderId, body),
    onSuccess: invalidate,
  });
};

export const useFollowupCancelledMutation = () => {
  const invalidate = useFollowupListsInvalidation();
  return useMutation({
    mutationFn: ({ orderId, ...body }: { orderId: number } & FollowupReasonBody) =>
      markFollowupCancelled(orderId, body),
    onSuccess: invalidate,
  });
};

export const useFollowupUndoClosureMutation = () => {
  const invalidate = useFollowupListsInvalidation();
  return useMutation({
    mutationFn: ({ orderId }: { orderId: number }) => undoFollowupClosure(orderId),
    onSuccess: invalidate,
  });
};

export const useFollowupOverdueMutation = () => {
  const invalidate = useFollowupListsInvalidation();
  return useMutation({
    mutationFn: ({ orderId, lateNotes }: { orderId: number; lateNotes: string }) =>
      markFollowupOverdue(orderId, lateNotes),
    onSuccess: invalidate,
  });
};
