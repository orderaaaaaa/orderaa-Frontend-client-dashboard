'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { markOrdersAsPrinted } from '../services/printOrders';
import {
  MarkOrdersPrintedRequest,
  MarkOrdersPrintedResponse,
} from '../types';

export function useMarkOrdersPrinted() {
  const queryClient = useQueryClient();

  return useMutation<
    MarkOrdersPrintedResponse,
    Error,
    MarkOrdersPrintedRequest
  >({
    mutationFn: markOrdersAsPrinted,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRINT_ORDER_STATISTICS],
      });
    },
  });
}
