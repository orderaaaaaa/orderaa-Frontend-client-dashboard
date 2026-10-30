import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useI18n } from '@/i18n/I18nProvider';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useHasPermission } from '@/hooks/usePermissions';
import { shippingApi } from '@/app/dashboard/link-shipping-company/api/shippingApi';
import { LOCATION_SOURCE_REFRESH_STATUSES } from '@/types/canonicalNames';
import type { LocationSyncRetry } from '@/components/shipping/LocationSyncNotice';
import { getApiErrorMessage } from '@/utils/apiError';
import { invalidateLocationOptionQueries } from '@/services/locationSourceSync';

export const useRequestShippingLocationSync = () => {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (shippingCompany: string) => shippingApi.requestLocationSync(shippingCompany),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['shipping-configs'] });
      invalidateLocationOptionQueries(queryClient);
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

export const useLocationSyncRetry = (
  shippingCompany: string | null | undefined
): LocationSyncRetry | null => {
  const canManage = useHasPermission(PERMISSION_CODES.SHIPPING_CONFIG_MANAGE);
  const request = useRequestShippingLocationSync();
  if (!canManage || !shippingCompany) return null;
  return {
    onRetry: () => request.mutate(shippingCompany),
    pending: request.isPending,
  };
};
