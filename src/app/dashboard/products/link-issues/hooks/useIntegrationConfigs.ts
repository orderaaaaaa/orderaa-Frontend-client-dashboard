import { useQuery } from '@tanstack/react-query';
import { integrationApi } from '@/app/dashboard/integrations/api/Integrations';
import { QUERY_KEYS } from '@/lib/api/queryKeys';

export const useIntegrationConfigs = (enabled: boolean) =>
  useQuery({
    queryKey: [QUERY_KEYS.INTEGRATION_CONFIGS],
    queryFn: integrationApi.getAll,
    enabled,
  });
