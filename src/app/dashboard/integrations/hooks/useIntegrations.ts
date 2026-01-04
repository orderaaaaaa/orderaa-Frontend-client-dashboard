import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationApi } from '../api/Integrations';

export const useIntegrations = () => {
  const queryClient = useQueryClient();

  const integrationsQuery = useQuery({
    queryKey: ['integration-configs'],
    queryFn: integrationApi.getAll,
  });

  const createIntegrationMutation = useMutation({
    mutationFn: (apiKey: string) => integrationApi.create(apiKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-configs'] });
    },
  });

  // NEW: Update mutation
  const updateIntegrationMutation = useMutation({
    mutationFn: ({ provider, apiKey }: { provider: string; apiKey: string }) =>
      integrationApi.update(provider, apiKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-configs'] });
    },
  });

  return {
    integrations: integrationsQuery.data,
    isLoading: integrationsQuery.isLoading,
    createIntegration: createIntegrationMutation.mutateAsync,
    updateIntegration: updateIntegrationMutation.mutateAsync, // Exported new hook
    isPending:
      createIntegrationMutation.isPending ||
      updateIntegrationMutation.isPending,
  };
};
