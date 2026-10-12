'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { markOrdersAsPrinted, reprintOrders } from '../services/printOrders';
import { ConfirmPrintedRequest, ConfirmPrintedResult } from '../types';

async function confirmPrinted({
  markIds,
  reprintIds,
  printTimes,
}: ConfirmPrintedRequest): Promise<ConfirmPrintedResult> {
  const result: ConfirmPrintedResult = {
    printedCount: 0,
    reprintedCount: 0,
    skippedIds: [],
  };
  if (markIds.length > 0) {
    const marked = await markOrdersAsPrinted({ ordersIds: markIds, printTimes });
    result.printedCount = marked.printedCount;
    result.skippedIds.push(...(marked.skippedIds ?? []));
  }
  if (reprintIds.length > 0) {
    try {
      const reprinted = await reprintOrders(reprintIds, printTimes);
      result.reprintedCount = reprinted.reprintedCount;
      result.skippedIds.push(...reprinted.skippedIds);
    } catch (error) {
      if (markIds.length === 0) throw error;
      result.reprintError = error;
    }
  }
  return result;
}

export function useMarkOrdersPrinted() {
  const queryClient = useQueryClient();

  return useMutation<ConfirmPrintedResult, Error, ConfirmPrintedRequest>({
    mutationFn: confirmPrinted,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRINT_ORDER_STATISTICS],
      });
    },
  });
}
