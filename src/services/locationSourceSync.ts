import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import http from '@/lib/api/http';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { useI18n } from '@/i18n/I18nProvider';
import { getApiErrorMessage } from '@/utils/apiError';
import { isLocationSyncInFlight } from '@/types/locationOptions';
import {
  LOCATION_SOURCE_REFRESH_STATUSES,
  type LocationSource,
  type LocationSourceRefreshResponse,
  type LocationSourcesStatus,
} from '@/types/canonicalNames';

const SYNC_POLL_MS = 5000;

export const isLocationSyncActive = (status: LocationSourcesStatus | undefined): boolean =>
  status !== undefined &&
  (status.running || status.sources.some((source) => isLocationSyncInFlight(source.sync)));

export const invalidateLocationOptionQueries = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LOCATION_OPTION_GOVERNORATES] });
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LOCATION_OPTION_CITIES] });
};

export const fetchLocationSourcesStatus = async (): Promise<LocationSourcesStatus> => {
  const { data } = await http.get<LocationSourcesStatus>(
    '/canonical-names/location-sources/status',
  );
  return data;
};

export const useLocationSourceSyncWatch = (status: LocationSourcesStatus | undefined) => {
  const queryClient = useQueryClient();
  const active = isLocationSyncActive(status);
  const wasActive = useRef(false);

  useQuery({
    queryKey: [QUERY_KEYS.CANONICAL_NAME_SOURCES_STATUS],
    queryFn: fetchLocationSourcesStatus,
    enabled: active,
    refetchInterval: SYNC_POLL_MS,
  });

  useEffect(() => {
    if (wasActive.current && !active) {
      invalidateLocationOptionQueries(queryClient);
    }
    wasActive.current = active;
  }, [active, queryClient]);
};

export const useRefreshLocationSource = (source: LocationSource) => {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationKey: [QUERY_KEYS.CANONICAL_NAME_SOURCES_REFRESH, source],
    mutationFn: async () => {
      const { data } = await http.post<LocationSourceRefreshResponse>(
        `/canonical-names/location-sources/refresh/${source}`,
      );
      return data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CANONICAL_NAME_SOURCES_STATUS] });
      if (result.status === LOCATION_SOURCE_REFRESH_STATUSES.ALREADY_RUNNING) {
        toast.info(t('canonical.sync.alreadyRunning'));
      } else {
        toast.success(t('canonical.sync.started'));
      }
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, t('canonical.sync.failed')));
    },
  });
};
