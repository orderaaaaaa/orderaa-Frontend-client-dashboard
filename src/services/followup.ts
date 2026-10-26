import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import {
  markFollowupChangeProducts,
  getExchangeCandidates,
  markFollowupClosed,
  markFollowupRefused,
  markFollowupCancelled,
  undoFollowupClosure,
  getFollowupNotes,
  addFollowupNote,
  editFollowupNote,
  deleteFollowupNote,
  getFollowupActionEvents,
  type FollowupChangeProductsBody,
  type FollowupNotePartyValue,
  type FollowupReasonBody,
} from '@/lib/api/followup';
import { getApiErrorMessage } from '@/utils/apiError';
import { KEY as SHIPPING_PROVIDERS_KEY } from '@/services/shippingProviders';

function useFollowupListsInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [SHIPPING_PROVIDERS_KEY] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DELAYED_ORDERS] });
  };
}

export const useFollowupChangeProductsMutation = () => {
  const invalidate = useFollowupListsInvalidation();
  return useMutation({
    mutationFn: ({ orderId, ...body }: { orderId: number } & FollowupChangeProductsBody) =>
      markFollowupChangeProducts(orderId, body),
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

export const useFollowupNotesQuery = (orderId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FOLLOWUP_NOTES, orderId] as QueryKey,
    queryFn: () => getFollowupNotes(orderId),
    enabled,
    staleTime: 0,
  });
};

export const useExchangeCandidatesQuery = (orderId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FOLLOWUP_EXCHANGE_CANDIDATES, orderId] as QueryKey,
    queryFn: () => getExchangeCandidates(orderId),
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
