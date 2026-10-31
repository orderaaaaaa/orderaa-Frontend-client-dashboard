import type { TranslationKey } from '@/i18n/translate';

const RETURN_TYPE_NOT_SENT = 'CARRIER_RETURN_TYPE_NOT_SENT';

export const carrierUnsupportedReasonOf = (
  reason: string | null,
  t: (key: TranslationKey) => string,
): string =>
  t(
    reason === RETURN_TYPE_NOT_SENT
      ? 'customerReturn.carrier.returnTypeNotSent'
      : 'customerReturn.carrier.unsupported',
  );
