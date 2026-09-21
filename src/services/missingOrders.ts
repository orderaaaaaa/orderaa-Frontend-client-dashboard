import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import http from '@/lib/api/http';
import type {
  MissingOrderDetail,
  MissingOrdersListFilters,
  MissingOrdersPage,
  RecoverMissingOrderPayload,
  RecoverMissingOrderResponse,
} from '@/types/missing-orders';

const KEY = 'missing-orders';

export const useMissingOrdersQuery = (filters: MissingOrdersListFilters) =>
  useQuery({
    queryKey: [KEY, 'list', filters],
    queryFn: async () => {
      const { data } = await http.get<MissingOrdersPage>('/missing-orders', {
        params: filters,
      });
      return data;
    },
  });

export const useMissingOrderQuery = (id: number | undefined) =>
  useQuery({
    queryKey: [KEY, 'detail', id],
    queryFn: async () => {
      const { data } = await http.get<MissingOrderDetail>(`/missing-orders/${id}`);
      return data;
    },
    enabled: id !== undefined,
  });

export const useRecoverMissingOrder = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RecoverMissingOrderPayload) => {
      const { data } = await http.post<RecoverMissingOrderResponse>(
        `/missing-orders/${id}/recover`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
  });
};

export const useDismissMissingOrder = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reason: string) => {
      const { data } = await http.post<MissingOrderDetail>(
        `/missing-orders/${id}/dismiss`,
        { reason },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
  });
};
