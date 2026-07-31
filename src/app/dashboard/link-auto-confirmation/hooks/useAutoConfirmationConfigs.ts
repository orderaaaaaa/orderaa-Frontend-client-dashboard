import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { automationConfigApi } from '../api/automation';
import {
  CreateAutoConfirmationConfigRequest,
  UpdateAutoConfirmationConfigRequest,
} from '../types/autoConfirmation';

export const useAutoConfirmationConfigs = () => {
  const queryClient = useQueryClient();

  const providersQuery = useQuery({
    queryKey: [QUERY_KEYS.AUTOMATION_PROVIDERS],
    queryFn: automationConfigApi.getProviders,
  });

  const configsQuery = useQuery({
    queryKey: [QUERY_KEYS.AUTOMATION_CONFIGS],
    queryFn: automationConfigApi.getAll,
  });

  const createConfigMutation = useMutation({
    mutationFn: (data: CreateAutoConfirmationConfigRequest) =>
      automationConfigApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.AUTOMATION_CONFIGS],
      });
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({
      configId,
      data,
    }: {
      configId: number;
      data: UpdateAutoConfirmationConfigRequest;
    }) => automationConfigApi.update(configId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.AUTOMATION_CONFIGS],
      });
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: (configId: number) => automationConfigApi.delete(configId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.AUTOMATION_CONFIGS],
      });
    },
  });

  return {
    providers: providersQuery.data?.providers,
    configs: configsQuery.data,
    isLoading: configsQuery.isLoading,
    isError: configsQuery.isError,
    createConfig: createConfigMutation.mutateAsync,
    isCreatePending: createConfigMutation.isPending,
    updateConfig: updateConfigMutation.mutateAsync,
    isUpdatePending: updateConfigMutation.isPending,
    deleteConfig: deleteConfigMutation.mutateAsync,
    isDeletePending: deleteConfigMutation.isPending,
  };
};
