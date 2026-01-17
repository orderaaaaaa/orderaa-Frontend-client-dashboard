import { useQuery, QueryKey } from '@tanstack/react-query';
import http from '@/lib/api/http';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { Order } from '@/types/orders';
import {
  PrintOrderStatisticsResponse,
  PrintOrdersResponse,
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

export async function printOrders(count: number): Promise<PrintOrdersResponse> {
  const response = await http.post<PrintOrdersResponse>('/orders/print', {
    count,
  });
  return response.data;
}

export async function markOrdersAsPrinted(
  payload: MarkOrdersPrintedRequest
): Promise<MarkOrdersPrintedResponse> {
  const response = await http.patch<MarkOrdersPrintedResponse>(
    '/orders/bulk',
    payload,
    { params: { status: 'CONFIRMED' } }
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
