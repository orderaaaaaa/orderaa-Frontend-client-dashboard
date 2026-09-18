import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationApi, storeApi, stockSyncApi } from '../api/Integrations';
import {
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
  UpdateStoreRequest,
  IntegrationProvider,
  StockSyncRequest,
  STOCK_PUSH_STATUS,
  STOCK_POLICY_STATUS,
} from '../types/apiIntegration';
import { QUERY_KEYS } from '@/lib/api/queryKeys';

const STOCK_SYNC_LIST_PAGE_SIZE = 10;
const STOCK_SYNC_POLICY_POLL_WINDOW_MS = 60000;

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

export const useStockSync = (
  configId: number,
  options: {
    provider: IntegrationProvider;
    stockSyncOn: boolean;
    canManage: boolean;
  }
) => {
  const { provider, stockSyncOn, canManage } = options;
  const isShopify = provider === IntegrationProvider.SHOPIFY;
  const queryClient = useQueryClient();

  const [pushLogPage, setPushLogPage] = useState(1);
  const [unlinkedPage, setUnlinkedPage] = useState(1);
  const [policyLogPage, setPolicyLogPage] = useState(1);

  const policyPollDeadlineRef = useRef(0);
  const isPolicyPollWindowActive = () =>
    Date.now() < policyPollDeadlineRef.current;
  const startPolicyPollWindow = () => {
    policyPollDeadlineRef.current = Date.now() + STOCK_SYNC_POLICY_POLL_WINDOW_MS;
  };

  const invalidateAfterMutation = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTEGRATION_CONFIGS] });
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.INTEGRATION_STOCK_PUSH_LOG, configId],
    });
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.INTEGRATION_STOCK_POLICY_LOG, configId],
    });
  };

  const pushPendingQuery = useQuery({
    queryKey: [QUERY_KEYS.INTEGRATION_STOCK_PUSH_LOG, configId, 'pending'],
    queryFn: () =>
      stockSyncApi.getPushLog(configId, {
        status: STOCK_PUSH_STATUS.PENDING,
        page: 1,
        limit: 1,
      }),
    refetchInterval: (query) => ((query.state.data?.total ?? 0) > 0 ? 5000 : false),
  });

  const hasPendingPush = (pushPendingQuery.data?.total ?? 0) > 0;

  const pushLogQuery = useQuery({
    queryKey: [QUERY_KEYS.INTEGRATION_STOCK_PUSH_LOG, configId, pushLogPage],
    queryFn: () =>
      stockSyncApi.getPushLog(configId, {
        status: STOCK_PUSH_STATUS.FAILED,
        page: pushLogPage,
        limit: STOCK_SYNC_LIST_PAGE_SIZE,
      }),
    refetchInterval: () => (hasPendingPush ? 5000 : false),
  });

  const unlinkedQuery = useQuery({
    queryKey: [QUERY_KEYS.INTEGRATION_STOCK_UNLINKED, configId, unlinkedPage],
    queryFn: () =>
      stockSyncApi.getUnlinked(configId, unlinkedPage, STOCK_SYNC_LIST_PAGE_SIZE),
  });

  const locationsQuery = useQuery({
    queryKey: [QUERY_KEYS.INTEGRATION_SHOPIFY_LOCATIONS, configId],
    queryFn: () => stockSyncApi.getShopifyLocations(configId),
    enabled: isShopify && stockSyncOn && canManage,
  });

  const policySkippedQuery = useQuery({
    queryKey: [QUERY_KEYS.INTEGRATION_STOCK_POLICY_LOG, configId, 'skipped'],
    queryFn: () =>
      stockSyncApi.getPolicyLog(configId, {
        status: STOCK_POLICY_STATUS.SKIPPED,
        page: 1,
        limit: 1,
      }),
    enabled: isShopify,
    refetchInterval: () => (isPolicyPollWindowActive() ? 5000 : false),
  });

  const policyPendingQuery = useQuery({
    queryKey: [QUERY_KEYS.INTEGRATION_STOCK_POLICY_LOG, configId, 'pending'],
    queryFn: () =>
      stockSyncApi.getPolicyLog(configId, {
        status: STOCK_POLICY_STATUS.PENDING,
        page: 1,
        limit: 1,
      }),
    enabled: isShopify,
    refetchInterval: (query) =>
      isPolicyPollWindowActive() || (query.state.data?.total ?? 0) > 0
        ? 5000
        : false,
  });

  const hasPendingPolicy = (policyPendingQuery.data?.total ?? 0) > 0;

  const policyLogQuery = useQuery({
    queryKey: [
      QUERY_KEYS.INTEGRATION_STOCK_POLICY_LOG,
      configId,
      'failed',
      policyLogPage,
    ],
    queryFn: () =>
      stockSyncApi.getPolicyLog(configId, {
        status: STOCK_POLICY_STATUS.FAILED,
        page: policyLogPage,
        limit: STOCK_SYNC_LIST_PAGE_SIZE,
      }),
    enabled: isShopify,
    refetchInterval: () =>
      isPolicyPollWindowActive() || hasPendingPolicy ? 5000 : false,
  });

  const saveMutation = useMutation({
    mutationFn: (data: StockSyncRequest) =>
      stockSyncApi.updateStockSync(configId, data),
    onSuccess: invalidateAfterMutation,
  });

  const retryMutation = useMutation({
    mutationFn: (variantIds?: number[]) => stockSyncApi.retry(configId, variantIds),
    onSuccess: invalidateAfterMutation,
  });

  const fullPushMutation = useMutation({
    mutationFn: () => stockSyncApi.fullPush(configId),
    onSuccess: invalidateAfterMutation,
  });

  const retryPolicyMutation = useMutation({
    mutationFn: () => stockSyncApi.retryPolicy(configId),
    onSuccess: invalidateAfterMutation,
  });

  return {
    pushLogQuery,
    pushLogPage,
    setPushLogPage,
    unlinkedQuery,
    unlinkedPage,
    setUnlinkedPage,
    locationsQuery,
    policyLogQuery,
    policyLogPage,
    setPolicyLogPage,
    policySkippedCount: policySkippedQuery.data?.total ?? 0,
    hasPendingPolicy,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    retry: retryMutation.mutateAsync,
    isRetrying: retryMutation.isPending,
    fullPush: fullPushMutation.mutateAsync,
    isFullPushing: fullPushMutation.isPending,
    retryPolicy: retryPolicyMutation.mutateAsync,
    isRetryingPolicy: retryPolicyMutation.isPending,
    startPolicyPollWindow,
  };
};
