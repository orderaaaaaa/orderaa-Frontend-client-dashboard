import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shippingApi } from '../api/shippingApi';

export const useShippingQuery = (providerId?: string) => {
  const queryClient = useQueryClient();

  // Fetch existing config
  const configQuery = useQuery({
    queryKey: ['shipping-config', providerId],
    queryFn: () => shippingApi.getConfig(),
    enabled: !!providerId,
  });

  // Mutation to save/update
  const upsertMutation = useMutation({
    mutationFn: async (data: any) => {
      return shippingApi.createConfig(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-config'] });
    },
  });

  return {
    config: configQuery.data,
    isLoading: configQuery.isLoading,
    isSaving: upsertMutation.isPending,
    saveConfig: upsertMutation.mutateAsync,
  };
};
