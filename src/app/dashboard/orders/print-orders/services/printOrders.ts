import { useQuery, QueryKey } from '@tanstack/react-query';
import http from '@/lib/api/http';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { Order } from '@/types/orders';
import {
  PrintOrderStatisticsResponse,
  ClaimNextPrintOrdersResponse,
  ClaimPrintOrdersResponse,
  ReleasePrintClaimsResponse,
  ReprintOrdersResponse,
  MarkOrdersPrintedRequest,
  MarkOrdersPrintedResponse,
  PrepareOrdersRequest,
  PrepareOrdersResponse,
  WaitingForPackagingRequest,
  WaitingForPackagingResponse,
  CallAgainRequest,
  CallAgainResponse,
} from '../types';

export const usePrintOrderStatisticsQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRINT_ORDER_STATISTICS] as QueryKey,
    queryFn: async () => {
      const response = await http.get<PrintOrderStatisticsResponse>(
        '/orders/packaging/statistics'
      );
      return response.data;
    },
  });
};

export const PRINT_CLAIM_MAX_IDS = 100;
export const PRINT_TIMES_MAX = 10;
export const PRINT_COUNT_MAX = 20;

function chunkIds(ids: number[]): number[][] {
  const unique = Array.from(new Set(ids));
  const chunks: number[][] = [];
  for (let i = 0; i < unique.length; i += PRINT_CLAIM_MAX_IDS) {
    chunks.push(unique.slice(i, i + PRINT_CLAIM_MAX_IDS));
  }
  return chunks;
}

export async function claimNextOrdersForPrint(
  count: number
): Promise<ClaimNextPrintOrdersResponse> {
  const response = await http.post<ClaimNextPrintOrdersResponse>(
    '/orders/print/claim-next',
    { count }
  );
  return response.data;
}

export async function claimOrdersForPrint(
  ordersIds: number[]
): Promise<ClaimPrintOrdersResponse> {
  const result: ClaimPrintOrdersResponse = { claimed: [], skipped: [] };
  for (const chunk of chunkIds(ordersIds)) {
    const response = await http.post<ClaimPrintOrdersResponse>(
      '/orders/print/claim',
      { ordersIds: chunk }
    );
    result.claimed.push(...response.data.claimed);
    result.skipped.push(...response.data.skipped);
  }
  return result;
}

export async function releasePrintClaims(
  ordersIds: number[]
): Promise<ReleasePrintClaimsResponse> {
  let released = 0;
  for (const chunk of chunkIds(ordersIds)) {
    const response = await http.post<ReleasePrintClaimsResponse>(
      '/orders/print/release',
      { ordersIds: chunk }
    );
    released += response.data.released;
  }
  return { released };
}

export async function reprintOrders(
  ordersIds: number[],
  printTimes: number
): Promise<ReprintOrdersResponse> {
  const result: ReprintOrdersResponse = {
    success: true,
    reprintedCount: 0,
    skippedIds: [],
  };
  for (const chunk of chunkIds(ordersIds)) {
    const response = await http.post<ReprintOrdersResponse>(
      '/orders/print/reprint',
      { ordersIds: chunk, printTimes }
    );
    result.reprintedCount += response.data.reprintedCount;
    result.skippedIds.push(...response.data.skippedIds);
  }
  return result;
}

export async function markOrdersAsPrinted(
  payload: MarkOrdersPrintedRequest
): Promise<MarkOrdersPrintedResponse> {
  const response = await http.put<MarkOrdersPrintedResponse>(
    '/orders/print/mark',
    { ordersIds: payload.ordersIds, printTimes: payload.printTimes ?? 1 }
  );
  return response.data;
}

export async function getOrderByCode(code: string): Promise<Order> {
  const response = await http.get<Order>(`/orders/by-code/${code}`);
  return response.data;
}

export async function prepareOrders(
  payload: PrepareOrdersRequest
): Promise<PrepareOrdersResponse> {
  const response = await http.post<PrepareOrdersResponse>(
    '/orders/prepare',
    payload
  );
  return response.data;
}

export async function waitingForPackaging(
  payload: WaitingForPackagingRequest
): Promise<WaitingForPackagingResponse> {
  const response = await http.post<WaitingForPackagingResponse>(
    '/orders/waiting-for-packaging',
    payload
  );
  return response.data;
}

export async function callAgainOrders(
  payload: CallAgainRequest
): Promise<CallAgainResponse> {
  const response = await http.post<CallAgainResponse>(
    '/orders/call-again',
    payload
  );
  return response.data;
}
