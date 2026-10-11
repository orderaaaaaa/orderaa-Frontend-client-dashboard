import { useCallback, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { lightfunnelsApi } from '../api/Integrations';
import {
  LIGHTFUNNELS_WEBHOOK_STATE,
  type ConnectLightfunnelsRequest,
  type LightfunnelsConnection,
  type LightfunnelsWebhookMode,
  type SetLightfunnelsWebhookModeResponse,
} from '../types/apiIntegration';

const SWITCHING_POLL_INTERVAL_MS = 5000;
const SWITCHING_POLL_WINDOW_MS = 15 * 60 * 1000;

export const useLightfunnelsConnections = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  const queryClient = useQueryClient();
  const switchingSinceRef = useRef<number | null>(null);

  const connectionsQuery = useQuery({
    queryKey: [QUERY_KEYS.LIGHTFUNNELS_CONNECTIONS],
    queryFn: lightfunnelsApi.getConnections,
    enabled,
    refetchInterval: (query) => {
      const switching = query.state.data?.some(
        (connection) => connection.webhookState === LIGHTFUNNELS_WEBHOOK_STATE.SWITCHING
      );
      if (!switching) {
        switchingSinceRef.current = null;
        return false;
      }
      switchingSinceRef.current ??= Date.now();
      return Date.now() - switchingSinceRef.current < SWITCHING_POLL_WINDOW_MS
        ? SWITCHING_POLL_INTERVAL_MS
        : false;
    },
  });

  const invalidateConnectionState = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LIGHTFUNNELS_CONNECTIONS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTEGRATION_CONFIGS] });
  }, [queryClient]);

  const connectMutation = useMutation({
    mutationFn: (data: ConnectLightfunnelsRequest) => lightfunnelsApi.connect(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LIGHTFUNNELS_CONNECTIONS] });
    },
  });

  const setWebhookModeMutation = useMutation({
    mutationFn: ({
      storeId,
      mode,
      confirmedCleanupIds,
    }: {
      storeId: number;
      mode: LightfunnelsWebhookMode;
      confirmedCleanupIds?: string[];
    }) =>
      lightfunnelsApi.setWebhookMode(
        storeId,
        confirmedCleanupIds ? { mode, confirmedCleanupIds } : { mode }
      ),
    onSuccess: (response: SetLightfunnelsWebhookModeResponse) => {
      if (response.consentRequired && response.authorizeUrl) {
        window.location.assign(response.authorizeUrl);
        return;
      }
      invalidateConnectionState();
    },
    onError: invalidateConnectionState,
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
    setWebhookMode: setWebhookModeMutation.mutateAsync,
    isSettingWebhookMode: setWebhookModeMutation.isPending,
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
