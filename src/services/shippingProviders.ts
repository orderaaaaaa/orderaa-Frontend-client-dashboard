import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import http from '@/lib/api/http';
import type {
  CarrierStats,
  LocationStats,
  ProviderShipment,
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

/** `carrierKey` is `provider:<id>` or `company:<SHIPPING_COMPANY>`. */
export const useCarrierLocationStatsQuery = (
  carrierKey: string | undefined,
  scope: 'governorates' | 'regions',
  range: StatsRange,
) =>
  useQuery({
    queryKey: [KEY, carrierKey, scope, range],
    queryFn: async () => {
      const { data } = await http.get<LocationStats[]>(
        `${BASE}/${encodeURIComponent(carrierKey!)}/stats/${scope}`,
        { params: range },
      );
      return data;
    },
    enabled: !!carrierKey,
  });

export const useCarrierShipmentsQuery = (
  carrierKey: string | undefined,
  range: StatsRange,
) =>
  useQuery({
    queryKey: [KEY, carrierKey, 'shipments', range],
    queryFn: async () => {
      const { data } = await http.get<ProviderShipment[]>(
        `${BASE}/${encodeURIComponent(carrierKey!)}/shipments`,
        { params: range },
      );
      return data;
    },
    enabled: !!carrierKey,
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
      toast.success('تمت إضافة جهة الشحن بنجاح');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'تعذر إضافة جهة الشحن');
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
      toast.success('تم حفظ التعديل');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'تعذر حفظ التعديل');
    },
  });
};
