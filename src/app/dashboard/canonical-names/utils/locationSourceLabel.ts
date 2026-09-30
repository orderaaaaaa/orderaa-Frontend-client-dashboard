import { providers } from '@/app/dashboard/link-shipping-company/constants/providers';
import { LOCATION_SOURCES, type LocationSource } from '@/types/canonicalNames';

export const SYSTEM_SOURCE_LABEL = 'النظام (System)';

export function locationSourceLabel(source: LocationSource | string): string {
  if (source === LOCATION_SOURCES.SYSTEM) return SYSTEM_SOURCE_LABEL;
  const lowered = source.toLowerCase();
  return providers.find((provider) => provider.id === lowered)?.name ?? source;
}
