export interface ArabicCountForms {
  one: string;
  two: string;
  few: string;
  many: string;
}

export const formatArabicCount = (count: number, forms: ArabicCountForms): string => {
  if (count === 1) return forms.one;
  if (count === 2) return forms.two;
  if (count >= 3 && count <= 10) return `${count} ${forms.few}`;
  return `${count} ${forms.many}`;
};
