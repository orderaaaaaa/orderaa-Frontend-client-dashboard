import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationApi } from '../api/Integrations';
import { CreateIntegrationRequest } from '../types/apiIntegration';

export const useIntegrations = () => {
  const queryClient = useQueryClient();

  const integrationsQuery = useQuery({
    queryKey: ['integration-configs'],
    queryFn: integrationApi.getAll,
  });

  const createIntegrationMutation = useMutation({
    mutationFn: (data: CreateIntegrationRequest) => integrationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-configs'] });
    },
  });

  return {
    integrations: integrationsQuery.data,
    isLoading: integrationsQuery.isLoading,
    createIntegration: createIntegrationMutation.mutateAsync,
    isPending: createIntegrationMutation.isPending,
  };
};
