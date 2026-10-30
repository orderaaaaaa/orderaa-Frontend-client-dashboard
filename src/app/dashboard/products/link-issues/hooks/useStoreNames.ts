import { useQuery } from '@tanstack/react-query';
import { integrationApi } from '@/app/dashboard/integrations/api/Integrations';
import { QUERY_KEYS } from '@/lib/api/queryKeys';

export const useIntegrationConfigs = (enabled: boolean) =>
  useQuery({
    queryKey: [QUERY_KEYS.INTEGRATION_CONFIGS],
    queryFn: integrationApi.getAll,
    enabled,
  });

export const useStoreNames = (enabled: boolean) => {
  const { data } = useIntegrationConfigs(enabled);
  const names = new Map<number, string>();
  for (const config of data ?? []) {
    if (config.store) names.set(config.storeId, config.store.name);
  }
  return (storeId: number | null): string | null =>
    storeId === null ? null : (names.get(storeId) ?? null);
};
