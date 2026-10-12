import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { invalidateAndWait } from '@/lib/query/mutationSync';
import { shippingApi } from '../api/shippingApi';
import { ShippingConfig } from '../types/shipping';

export const useShippingQuery = (providerId?: string) => {
  const queryClient = useQueryClient();

  const configQuery = useQuery<ShippingConfig[]>({
    queryKey: ['shipping-configs'],
    queryFn: async () => {
      const data = await shippingApi.getConfig();
      return Array.isArray(data) ? data : [];
    },
  });

  // Find specific config based on providerId
  const config = providerId
    ? configQuery.data?.find(
        (c) =>
          c.shippingCompany === providerId ||
          c.shippingCompany === providerId.toUpperCase()
      )
    : undefined;

  const refreshConfigs = () =>
    invalidateAndWait(queryClient, [
      ['shipping-configs'],
      [QUERY_KEYS.SHIPPING_COMPANIES],
    ]);

  const upsertMutation = useMutation({
    mutationFn: async (data: any) => {
      return shippingApi.createConfig(data);
    },
    onSuccess: refreshConfigs,
  });

  const updateConfig = useMutation({
    mutationFn: async ({
      data,
      shippingCompany,
    }: {
      data: any;
      shippingCompany: string;
    }) => {
      return shippingApi.updateConfig(data, shippingCompany);
    },
    onSuccess: refreshConfigs,
  });

  return {
    configs: configQuery.data ?? [],
    config,
    isLoading: configQuery.isLoading,
    isError: configQuery.isError,
    error: configQuery.error,
    refetch: configQuery.refetch,
    isSaving: upsertMutation.isPending || updateConfig.isPending,
    saveConfig: upsertMutation.mutateAsync,
    updateConfig: updateConfig.mutateAsync,
    isUpdatingConfig: updateConfig.isPending,
    errorUpdateConfig: updateConfig.isError,
  };
};
