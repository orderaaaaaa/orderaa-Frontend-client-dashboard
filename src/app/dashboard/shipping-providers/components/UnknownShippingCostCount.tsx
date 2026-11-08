'use client';

import { useI18n } from '@/i18n/I18nProvider';
import { pluralFormOf, type PluralForm } from '@/i18n/pluralAr';
import type { TranslationKey } from '@/i18n/translate';
import { formatNumber } from './formatNumber';

const UNKNOWN_COUNT_KEYS: Record<PluralForm, TranslationKey> = {
  one: 'inProcess.net.unknownCount.one',
  two: 'inProcess.net.unknownCount.two',
  few: 'inProcess.net.unknownCount.few',
  many: 'inProcess.net.unknownCount.many',
};

export function UnknownShippingCostCount({ count }: { count: number | undefined }) {
  const { t } = useI18n();
  if (!count) return null;
  return (
    <span className="mt-1 block text-xs font-normal text-muted-foreground">
      {t(UNKNOWN_COUNT_KEYS[pluralFormOf(count)], { n: formatNumber(count) })}
    </span>
  );
}
