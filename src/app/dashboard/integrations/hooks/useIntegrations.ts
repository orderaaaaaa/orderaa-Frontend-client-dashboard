import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationApi, storeApi } from '../api/Integrations';
import {
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
  UpdateStoreRequest,
} from '../types/apiIntegration';
import { QUERY_KEYS } from '@/lib/api/queryKeys';

export const useIntegrations = () => {
  const queryClient = useQueryClient();

  const integrationsQuery = useQuery({
    queryKey: [QUERY_KEYS.INTEGRATION_CONFIGS],
    queryFn: integrationApi.getAll,
  });

  const createIntegrationMutation = useMutation({
    mutationFn: (data: CreateIntegrationRequest) => integrationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTEGRATION_CONFIGS] });
    },
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: ({ configId, data }: { configId: number; data: UpdateIntegrationRequest }) =>
      integrationApi.update(configId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTEGRATION_CONFIGS] });
    },
  });

  const deleteIntegrationMutation = useMutation({
    mutationFn: (configId: number) => integrationApi.delete(configId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTEGRATION_CONFIGS] });
    },
  });

  const updateStoreMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStoreRequest }) =>
      storeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTEGRATION_CONFIGS] });
    },
  });

  const deleteStoreMutation = useMutation({
    mutationFn: (id: number) => storeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTEGRATION_CONFIGS] });
    },
  });

  return {
    integrations: integrationsQuery.data,
    isLoading: integrationsQuery.isLoading,
    createIntegration: createIntegrationMutation.mutateAsync,
    isPending: createIntegrationMutation.isPending,
    updateIntegration: updateIntegrationMutation.mutateAsync,
    isUpdatePending: updateIntegrationMutation.isPending,
    deleteIntegration: deleteIntegrationMutation.mutateAsync,
    isDeletePending: deleteIntegrationMutation.isPending,
    updateStore: updateStoreMutation.mutateAsync,
    isStoreUpdatePending: updateStoreMutation.isPending,
    deleteStore: deleteStoreMutation.mutateAsync,
    isStoreDeletePending: deleteStoreMutation.isPending,
  };
};
