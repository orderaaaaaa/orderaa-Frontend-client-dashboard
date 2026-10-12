'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidateAndWait, orderStatusKeys } from '@/lib/query/mutationSync';
import {
  submitForApproval,
  SubmitForApprovalRequest,
  SubmitForApprovalResponse,
} from '../services/shippingOrders';

export function useSubmitForApproval() {
  const queryClient = useQueryClient();

  return useMutation<SubmitForApprovalResponse, Error, SubmitForApprovalRequest>({
    mutationFn: submitForApproval,
    onSuccess: () => invalidateAndWait(queryClient, orderStatusKeys()),
  });
}
