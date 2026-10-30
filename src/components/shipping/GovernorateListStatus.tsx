'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nProvider';
import {
  LOCATION_OPTION_ERROR_CODES,
  locationOptionErrorCodeOf,
  locationOptionsErrorTextOf,
} from '@/types/locationOptions';

export const CANONICAL_GOVERNORATES_HREF = '/dashboard/canonical-names/governorates';

export function GovernorateCanonicalLink() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-start gap-1">
      <Button asChild variant="outline" size="sm">
        <Link href={CANONICAL_GOVERNORATES_HREF} target="_blank" rel="noopener">
          {t('canonical.shipping.openPage')}
        </Link>
      </Button>
      <p className="text-xs text-muted-foreground">
        {t('canonical.shipping.openPageHint')}
      </p>
    </div>
  );
}

interface GovernorateSourceEmptyProps {
  canRead: boolean;
}

export function GovernorateSourceEmpty({ canRead }: GovernorateSourceEmptyProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-2 text-xs text-muted-foreground">
      <p>{t('canonical.shipping.noList')}</p>
      {canRead ? (
        <>
          <p>{t('canonical.shipping.noListHelp')}</p>
          <GovernorateCanonicalLink />
        </>
      ) : (
        <p>{t('canonical.shipping.askAdmin')}</p>
      )}
    </div>
  );
}

interface GovernorateListErrorProps {
  error: unknown;
  onRetry: () => void;
}

export function GovernorateListError({ error, onRetry }: GovernorateListErrorProps) {
  const { t } = useI18n();
  const canRetry =
    locationOptionErrorCodeOf(error) !== LOCATION_OPTION_ERROR_CODES.PROVIDER_NOT_SUPPORTED;
  return (
    <div className="flex flex-col items-start gap-2">
      <p className="text-xs text-destructive">
        {locationOptionsErrorTextOf(error, t('canonical.shipping.loadError'))}
      </p>
      {canRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
