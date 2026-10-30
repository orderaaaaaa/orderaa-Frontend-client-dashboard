import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { invalidateAndWait } from '@/lib/query/mutationSync';
import { shippingApi } from '../api/shippingApi';
import { hasLocationSyncInFlight, isLocationSyncInFlight } from '@/types/locationOptions';
import { invalidateLocationOptionQueries } from '@/services/locationSourceSync';
import { ShippingConfig, ShippingConfigPayload } from '../types/shipping';

const SHIPPING_CONFIG_POLL_MS = 5000;

export const useShippingQuery = (providerId?: string) => {
  const queryClient = useQueryClient();

  const configQuery = useQuery<ShippingConfig[]>({
    queryKey: ['shipping-configs'],
    queryFn: async () => {
      const data = await shippingApi.getConfig();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: (query) =>
      hasLocationSyncInFlight(query.state.data) ? SHIPPING_CONFIG_POLL_MS : false,
  });

  const inFlightCompanies = useRef<Set<string>>(new Set());

  useEffect(() => {
    const inFlight = new Set(
      (configQuery.data ?? [])
        .filter((config) => isLocationSyncInFlight(config.locationSync))
        .map((config) => config.shippingCompany)
        .filter((company): company is string => company !== undefined),
    );
    const settled = Array.from(inFlightCompanies.current).some((company) => !inFlight.has(company));
    if (settled) invalidateLocationOptionQueries(queryClient);
    inFlightCompanies.current = inFlight;
  }, [configQuery.data, queryClient]);

  // Find specific config based on providerId
  const config = providerId
    ? configQuery.data?.find(
        (c) =>
          c.shippingCompany === providerId ||
          c.shippingCompany === providerId.toUpperCase()
      )
    : undefined;

  const refreshConfigs = () =>
    invalidateAndWait(queryClient, [
      ['shipping-configs'],
      [QUERY_KEYS.SHIPPING_COMPANIES],
    ]);

  const upsertMutation = useMutation({
    mutationFn: async (data: ShippingConfigPayload) => {
      return shippingApi.createConfig(data);
    },
    onSuccess: refreshConfigs,
  });

  const updateConfig = useMutation({
    mutationFn: async ({
      data,
      shippingCompany,
    }: {
      data: ShippingConfigPayload;
      shippingCompany: string;
    }) => {
      return shippingApi.updateConfig(data, shippingCompany);
    },
    onSuccess: refreshConfigs,
  });

  return {
    configs: configQuery.data ?? [],
    config,
    isLoading: configQuery.isLoading,
    isError: configQuery.isError,
    error: configQuery.error,
    refetch: configQuery.refetch,
    isSaving: upsertMutation.isPending || updateConfig.isPending,
    saveConfig: upsertMutation.mutateAsync,
    updateConfig: updateConfig.mutateAsync,
    isUpdatingConfig: updateConfig.isPending,
    errorUpdateConfig: updateConfig.isError,
  };
};
