import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import http from '@/lib/api/http';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { invalidateAndWait } from '@/lib/query/mutationSync';
import type {
  CarrierSendCloseChoice,
  CarrierSendListResponse,
  CarrierSendOpenPage,
  CloseCarrierSendResponse,
  DispatchCarrierSendResponse,
  SendAgainCarrierSendResponse,
  SuccessResponse,
} from '@/types/carrierSends';

const CARRIER_SENDS_OPEN_PAGE_LIMIT = 20;

export const carrierSendsOrderKey = (orderId: number) =>
  [QUERY_KEYS.CARRIER_SENDS, 'order', orderId] as const;

export const carrierSendsOpenKey = [QUERY_KEYS.CARRIER_SENDS, 'open'] as const;

const invalidateCarrierSends = (queryClient: QueryClient) =>
  invalidateAndWait(queryClient, [
    [QUERY_KEYS.CARRIER_SENDS],
    [QUERY_KEYS.ORDER_DETAILS],
    [QUERY_KEYS.ORDERS],
    [QUERY_KEYS.DELAYED_ORDERS],
  ]);

export const useCarrierSendsForOrder = (orderId: number) =>
  useQuery({
    queryKey: carrierSendsOrderKey(orderId),
    queryFn: async () => {
      const { data } = await http.get<CarrierSendListResponse>(
        `/orders/${orderId}/carrier-sends`,
      );
      return data.data;
    },
    enabled: !!orderId,
  });

export const useCarrierSendsOpen = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useInfiniteQuery({
    queryKey: carrierSendsOpenKey,
    enabled,
    queryFn: async ({ pageParam }) => {
      const { data } = await http.get<CarrierSendOpenPage>('/carrier-sends/open', {
        params: { limit: CARRIER_SENDS_OPEN_PAGE_LIMIT, cursor: pageParam ?? undefined },
      });
      return data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

export interface CloseCarrierSendBody {
  outcome: CarrierSendCloseChoice;
  shipmentId?: string;
  note?: string;
}

export const useCloseCarrierSend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      markerId,
      body,
    }: {
      orderId: number;
      markerId: number;
      body: CloseCarrierSendBody;
    }) => {
      const { data } = await http.post<CloseCarrierSendResponse>(
        `/orders/${orderId}/carrier-sends/${markerId}/close`,
        body,
      );
      return data;
    },
    onSuccess: () => invalidateCarrierSends(queryClient),
  });
};

export const useDispatchCarrierSend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, markerId }: { orderId: number; markerId: number }) => {
      const { data } = await http.post<DispatchCarrierSendResponse>(
        `/orders/${orderId}/carrier-sends/${markerId}/dispatch`,
      );
      return data;
    },
    onSuccess: () => invalidateCarrierSends(queryClient),
  });
};

export const useSendAgainCarrierSend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, markerId }: { orderId: number; markerId: number }) => {
      const { data } = await http.post<SendAgainCarrierSendResponse>(
        `/orders/${orderId}/carrier-sends/${markerId}/send-again`,
        { shipmentChecked: true },
      );
      return data;
    },
    onSuccess: () => invalidateCarrierSends(queryClient),
  });
};

export const useOldShipmentCancelledByHand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      oldShippingId,
      oldCompanyId,
    }: {
      orderId: number;
      oldShippingId: string;
      oldCompanyId: number;
    }) => {
      const { data } = await http.post<SuccessResponse>(
        `/orders/${orderId}/old-shipment-cancelled`,
        { oldShippingId, oldCompanyId },
      );
      return data;
    },
    onSuccess: () => invalidateCarrierSends(queryClient),
  });
};
