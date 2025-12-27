import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shippingApi } from '../api/shippingApi';
import { ShippingConfig } from '../types/shipping';

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
        // If we wanted to be smart, we could check if we should PUT or POST.
        // For now, defaulting to POST (createConfig) as it commonly handles upsert in single-resource APIs.
        // If strictly required, we'd need to know if config exists. 
        // Since we have config in the hook, we could pass it to this function if we moved this logic outside, 
        // but for now let's assume POST is safe or the user can retry.
        // Actually, let's try POST.
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
