import { readStoredLocale } from '@/i18n/locale';
import { translate, type TranslationKey } from '@/i18n/translate';
import {
  LOCATION_SYNC_STATUSES,
  type LocationSourceSync,
  type LocationSyncStatus,
} from '@/types/canonicalNames';

export const LOCATION_OPTION_KINDS = {
  CANONICAL: 'CANONICAL',
  ROW: 'ROW',
} as const;

export type LocationOptionKind =
  (typeof LOCATION_OPTION_KINDS)[keyof typeof LOCATION_OPTION_KINDS];

export interface LocationOption {
  value: string;
  kind: LocationOptionKind;
  label: string;
  canonicalNameId: number | null;
  rowId: number;
  stale: boolean;
}

export interface LocationOptionsResponse {
  sourceHasRows: boolean;
  options: LocationOption[];
  sync?: LocationSourceSync | null;
}

export const isLocationSyncInFlight = (
  sync: { status: LocationSyncStatus } | null | undefined
): boolean =>
  sync?.status === LOCATION_SYNC_STATUSES.QUEUED ||
  sync?.status === LOCATION_SYNC_STATUSES.RUNNING;

export const hasLocationSyncInFlight = (
  configs: { locationSync?: { status: LocationSyncStatus } | null }[] | undefined
): boolean => configs?.some((config) => isLocationSyncInFlight(config.locationSync)) ?? false;

export const LOCATION_OPTION_ERROR_CODES = {
  LOCATION_OPTION_INVALID: 'LOCATION_OPTION_INVALID',
  LOCATION_PICK_CONFLICT: 'LOCATION_PICK_CONFLICT',
  PROVIDER_NOT_SUPPORTED: 'PROVIDER_NOT_SUPPORTED',
} as const;

export type LocationOptionErrorCode =
  (typeof LOCATION_OPTION_ERROR_CODES)[keyof typeof LOCATION_OPTION_ERROR_CODES];

export const LOCATION_OPTION_ERROR_MESSAGES: Record<LocationOptionErrorCode, TranslationKey> = {
  LOCATION_OPTION_INVALID: 'canonical.location.optionInvalid',
  LOCATION_PICK_CONFLICT: 'canonical.location.pickConflict',
  PROVIDER_NOT_SUPPORTED: 'canonical.location.providerNotSupported',
};

const KNOWN_LOCATION_OPTION_ERROR_CODES = new Set<string>(
  Object.values(LOCATION_OPTION_ERROR_CODES)
);

export const locationOptionErrorCodeOf = (
  err: unknown
): LocationOptionErrorCode | null => {
  const code = (err as { response?: { data?: { code?: unknown } } })?.response
    ?.data?.code;
  return typeof code === 'string' && KNOWN_LOCATION_OPTION_ERROR_CODES.has(code)
    ? (code as LocationOptionErrorCode)
    : null;
};

export const LOCATION_OPTION_STALE_HINT: TranslationKey = 'canonical.location.staleHint';

export const locationSelectOptionsOf = (options: LocationOption[]) =>
  options.map((option) => ({
    key: option.value,
    label: option.stale
      ? `${option.label} (${translate(readStoredLocale(), LOCATION_OPTION_STALE_HINT)})`
      : option.label,
  }));

export const locationOptionsErrorTextOf = (error: unknown, fallback: string) => {
  const code = locationOptionErrorCodeOf(error);
  return code ? translate(readStoredLocale(), LOCATION_OPTION_ERROR_MESSAGES[code]) : fallback;
};

export const locationSaveErrorTextOf = (error: unknown, fallback: string) => {
  const code = locationOptionErrorCodeOf(error);
  if (code) return translate(readStoredLocale(), LOCATION_OPTION_ERROR_MESSAGES[code]);
  const message = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  if (Array.isArray(message)) return message.join('\n');
  return typeof message === 'string' && message ? message : fallback;
};
