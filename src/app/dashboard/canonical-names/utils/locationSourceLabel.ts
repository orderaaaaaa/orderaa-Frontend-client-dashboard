import { providers } from '@/app/dashboard/link-shipping-company/constants/providers';
import { readStoredLocale } from '@/i18n/locale';
import { translate } from '@/i18n/translate';
import { LOCATION_SOURCES, type LocationSource } from '@/types/canonicalNames';

export function locationSourceLabel(source: LocationSource | string): string {
  if (source === LOCATION_SOURCES.SYSTEM) {
    return translate(readStoredLocale(), 'canonical.status.source.SYSTEM');
  }
  const lowered = source.toLowerCase();
  return providers.find((provider) => provider.id === lowered)?.name ?? source;
}
