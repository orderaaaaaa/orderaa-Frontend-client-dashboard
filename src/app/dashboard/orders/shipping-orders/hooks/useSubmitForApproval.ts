'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import {
  submitForApproval,
  SubmitForApprovalRequest,
  SubmitForApprovalResponse,
} from '../services/shippingOrders';

export function useSubmitForApproval() {
  const queryClient = useQueryClient();

  return useMutation<SubmitForApprovalResponse, Error, SubmitForApprovalRequest>({
    mutationFn: submitForApproval,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
    },
  });
}
