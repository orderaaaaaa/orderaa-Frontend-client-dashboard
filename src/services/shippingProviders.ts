import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import http from '@/lib/api/http';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { getApiErrorMessage } from '@/utils/apiError';
import type {
  CarrierStats,
  LocationStats,
  ProviderShipmentsPage,
  ShipmentStatusFilter,
  ShippingProvider,
  ShippingProviderType,
  StatsRange,
} from '@/types/shippingProviders';

const BASE = '/shipping/providers';
const KEY = 'shipping-providers';

export const useShippingProvidersQuery = (filters?: {
  type?: ShippingProviderType;
  isActive?: boolean;
}) =>
  useQuery({
    queryKey: [KEY, filters],
    queryFn: async () => {
      const { data } = await http.get<ShippingProvider[]>(BASE, {
        params: filters,
      });
      return data;
    },
  });

export const useCarrierStatsQuery = (range: StatsRange) =>
  useQuery({
    queryKey: [KEY, 'stats', range],
    queryFn: async () => {
      const { data } = await http.get<CarrierStats[]>(`${BASE}/stats`, {
        params: range,
      });
      return data;
    },
  });

export const useCarrierLocationStatsQuery = (
  shippingCompanyId: number | undefined,
  scope: 'governorates' | 'regions',
  range: StatsRange,
) =>
  useQuery({
    queryKey: [KEY, shippingCompanyId, scope, range],
    queryFn: async () => {
      const { data } = await http.get<LocationStats[]>(
        `${BASE}/${shippingCompanyId}/stats/${scope}`,
        { params: range },
      );
      return data;
    },
    enabled: !!shippingCompanyId,
  });

export const useCarrierShipmentsQuery = (
  shippingCompanyId: number | undefined,
  params: StatsRange & {
    status: ShipmentStatusFilter;
    page: number;
    limit: number;
  },
) =>
  useQuery({
    queryKey: [KEY, shippingCompanyId, 'shipments', params],
    queryFn: async () => {
      const { data } = await http.get<ProviderShipmentsPage>(
        `${BASE}/${shippingCompanyId}/shipments`,
        { params },
      );
      return data;
    },
    enabled: !!shippingCompanyId,
    placeholderData: keepPreviousData,
  });

export const useCreateShippingProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      type: ShippingProviderType;
      name: string;
      phone?: string;
    }) => {
      const { data } = await http.post<ShippingProvider>(BASE, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SHIPPING_COMPANIES] });
      toast.success('تمت إضافة جهة الشحن بنجاح');
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, 'تعذر إضافة جهة الشحن'));
    },
  });
};

/** There is no delete: `isActive: false` retires a provider but keeps history. */
export const useUpdateShippingProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: number;
      name?: string;
      phone?: string;
      isActive?: boolean;
    }) => {
      const { id, ...body } = payload;
      const { data } = await http.patch<ShippingProvider>(
        `${BASE}/${id}`,
        body,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SHIPPING_COMPANIES] });
      toast.success('تم حفظ التعديل');
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, 'تعذر حفظ التعديل'));
    },
  });
};
