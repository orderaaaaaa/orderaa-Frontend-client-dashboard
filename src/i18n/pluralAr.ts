import type { TranslationKey, TranslationParams } from './translate';

export const PLURAL_NOUNS = [
  'spelling',
  'value',
  'attribute',
  'product',
  'order',
  'alias',
  'item',
  'location',
  'carrier',
  'governorate',
  'city',
  'suggestion',
  'name',
] as const;

export type PluralNoun = (typeof PLURAL_NOUNS)[number];

export type PluralForm = 'one' | 'two' | 'few' | 'many';

export function pluralFormOf(count: number): PluralForm {
  if (count === 1) return 'one';
  if (count === 2) return 'two';
  if (count >= 3 && count <= 10) return 'few';
  return 'many';
}

export function pluralAr(
  t: (key: TranslationKey, params?: TranslationParams) => string,
  noun: PluralNoun,
  count: number
): string {
  return t(`canonical.noun.${noun}.${pluralFormOf(count)}` as TranslationKey);
}
