import { pluralAr } from '@/i18n/pluralAr';
import type { TranslationKey, TranslationParams } from '@/i18n/translate';
import type { CanonicalName } from '@/types/canonicalNames';

type Translate = (key: TranslationKey, params?: TranslationParams) => string;

export function nameCountText(t: Translate, isLocation: boolean, name: CanonicalName): string {
  if (isLocation) {
    return t('canonical.name.orderCount', {
      count: name.orderCount,
      ordersNoun: pluralAr(t, 'order', name.orderCount),
    });
  }
  return t('canonical.name.aliasCount', {
    count: name.aliasCount,
    aliasNoun: pluralAr(t, 'alias', name.aliasCount),
  });
}
