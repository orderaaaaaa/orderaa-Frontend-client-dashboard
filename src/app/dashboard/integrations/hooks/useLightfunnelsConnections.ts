import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { lightfunnelsApi } from '../api/Integrations';
import type {
  ConnectLightfunnelsRequest,
  LightfunnelsConnection,
} from '../types/apiIntegration';

export const useLightfunnelsConnections = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  const queryClient = useQueryClient();

  const connectionsQuery = useQuery({
    queryKey: [QUERY_KEYS.LIGHTFUNNELS_CONNECTIONS],
    queryFn: lightfunnelsApi.getConnections,
    enabled,
  });

  const connectMutation = useMutation({
    mutationFn: (data: ConnectLightfunnelsRequest) => lightfunnelsApi.connect(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LIGHTFUNNELS_CONNECTIONS] });
    },
  });

  const connections = connectionsQuery.data;

  const findConnection = useCallback(
    (storeId: number): LightfunnelsConnection | undefined =>
      connections?.find((connection) => connection.storeId === storeId),
    [connections]
  );

  return {
    connections,
    isLoading: connectionsQuery.isLoading,
    findConnection,
    connect: connectMutation.mutateAsync,
    isConnecting: connectMutation.isPending,
  };
};

export const useLightfunnelsRedirectUri = (enabled: boolean) => {
  const redirectUriQuery = useQuery({
    queryKey: [QUERY_KEYS.LIGHTFUNNELS_REDIRECT_URI],
    queryFn: lightfunnelsApi.getRedirectUri,
    enabled,
    staleTime: Infinity,
  });

  return {
    redirectUri: redirectUriQuery.data?.redirectUri ?? '',
    scopes: redirectUriQuery.data?.scopes ?? '',
    isLoading: redirectUriQuery.isLoading,
    isError: redirectUriQuery.isError,
    error: redirectUriQuery.error,
  };
};

export const useInvalidateLightfunnelsState = () => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LIGHTFUNNELS_CONNECTIONS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTEGRATION_CONFIGS] });
  }, [queryClient]);
};
