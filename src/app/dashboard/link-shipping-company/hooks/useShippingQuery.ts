import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

  const upsertMutation = useMutation({
    mutationFn: async (data: any) => {
      return shippingApi.createConfig(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-configs'] });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-configs'] });
    },
  });

  return {
    configs: configQuery.data ?? [],
    config,
    isLoading: configQuery.isLoading,
    isSaving: upsertMutation.isPending,
    saveConfig: upsertMutation.mutateAsync,
    updateConfig: updateConfig.mutateAsync,
    isUpdatingConfig: upsertMutation.isPending,
    errorUpdateConfig: upsertMutation.isError,
  };
};
