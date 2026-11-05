export interface ArabicCountForms {
  one: string;
  two: string;
  few: string;
  many: string;
  singular: string;
}

export const formatArabicCount = (count: number, forms: ArabicCountForms): string => {
  if (count === 1) return forms.one;
  if (count === 2) return forms.two;
  if (count === 0) return `${count} ${forms.few}`;
  const tail = count % 100;
  if (tail >= 3 && tail <= 10) return `${count} ${forms.few}`;
  if (tail >= 11) return `${count} ${forms.many}`;
  return `${count} ${forms.singular}`;
};

export const CREATED_ORDER_COUNT_FORMS: ArabicCountForms = {
  one: 'طلب واحد',
  two: 'طلبين',
  few: 'طلبات',
  many: 'طلبًا',
  singular: 'طلب',
};
