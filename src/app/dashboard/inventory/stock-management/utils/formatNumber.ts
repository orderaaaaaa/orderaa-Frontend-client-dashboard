import { formatNumber, formatStockNumber, toStockNumber } from '@/utils/format';

export { formatStockNumber };

export interface ArabicPluralForms {
  one: string;
  two: string;
  few: string;
  many: string;
}

export const STOCK_QUANTITY_FORMS: ArabicPluralForms = { one: 'قطعة', two: 'قطعتان', few: 'قطع', many: 'قطعة' };
export const VARIANT_COUNT_FORMS: ArabicPluralForms = { one: 'متغير', two: 'متغيران', few: 'متغيرات', many: 'متغيرًا' };
export const ORDER_FORMS: ArabicPluralForms = { one: 'طلب', two: 'طلبان', few: 'طلبات', many: 'طلبًا' };

export const pluralArabic = (count: number, forms: ArabicPluralForms): string => {
  const n = Math.abs(count);
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  const tail = n % 100;
  if (n >= 100 && tail <= 2) return forms.one;
  if (tail >= 3 && tail <= 10) return forms.few;
  return forms.many;
};

export const formatStockAmount = (value: unknown, forms: ArabicPluralForms): string => {
  const amount = toStockNumber(value);
  return `${formatNumber(amount)} ${pluralArabic(amount, forms)}`;
};

export const formatStockQuantity = (value: unknown): string => formatStockAmount(value, STOCK_QUANTITY_FORMS);

export const formatVariantCount = (value: unknown): string => formatStockAmount(value, VARIANT_COUNT_FORMS);
