import { useMutation, useQuery, useQueryClient, keepPreviousData, type QueryKey } from '@tanstack/react-query';
import { toast } from 'react-toastify';
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
  getFollowupNotes,
  addFollowupNote,
  editFollowupNote,
  deleteFollowupNote,
  getFollowupActionEvents,
  type FollowupChangeProductInput,
  type FollowupNotePartyValue,
  type FollowupReasonBody,
} from '@/lib/api/followup';
import type { FollowupFilters, ShippingPointType } from '@/types/logistics';
import { getApiErrorMessage } from '@/utils/apiError';

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

export const useFollowupNotesQuery = (orderId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FOLLOWUP_NOTES, orderId] as QueryKey,
    queryFn: () => getFollowupNotes(orderId),
    enabled,
    staleTime: 0,
  });
};

export const useFollowupActionEventsQuery = (orderId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FOLLOWUP_ACTION_EVENTS, orderId] as QueryKey,
    queryFn: () => getFollowupActionEvents(orderId),
    enabled,
    staleTime: 0,
  });
};

interface AddFollowupNoteVariables {
  orderId: number;
  party: FollowupNotePartyValue;
  body: string;
}

export const useAddFollowupNoteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, party, body }: AddFollowupNoteVariables) =>
      addFollowupNote(orderId, { party, body }),
    onSuccess: (_note, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLLOWUP_NOTES, orderId] });
      toast.success('تمت إضافة الملاحظة');
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, 'تعذر إضافة الملاحظة'));
    },
  });
};

interface EditFollowupNoteVariables {
  orderId: number;
  noteId: number;
  body: string;
}

export const useEditFollowupNoteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, noteId, body }: EditFollowupNoteVariables) =>
      editFollowupNote(orderId, noteId, { body }),
    onSuccess: (_note, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLLOWUP_NOTES, orderId] });
      toast.success('تم حفظ الملاحظة');
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, 'تعذر حفظ الملاحظة'));
    },
  });
};

interface DeleteFollowupNoteVariables {
  orderId: number;
  noteId: number;
}

export const useDeleteFollowupNoteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, noteId }: DeleteFollowupNoteVariables) => deleteFollowupNote(orderId, noteId),
    onSuccess: (_result, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLLOWUP_NOTES, orderId] });
      toast.success('تم حذف الملاحظة');
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, 'تعذر حذف الملاحظة'));
    },
  });
};
