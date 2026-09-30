import type {
  CreateProductAttribute,
  CreateProductPayload,
  CreateProductVariantOption,
} from '../types/products';

export function duplicateNameKey(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/ـ/g, '')
    .replace(/[ً-ٟؐ-ؚۖ-ٰۭ]/g, '')
    .replace(/[ًٌٍَُِّّْ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ی/g, 'ي')
    .replace(/ک/g, 'ك');
}

export function duplicateNames(names: string[]): string[] {
  const groups = new Map<string, string[]>();
  for (const name of names) {
    const key = duplicateNameKey(name);
    groups.set(key, [...(groups.get(key) ?? []), name]);
  }
  return [...groups.values()]
    .filter((group) => group.length > 1)
    .flatMap((group) => [...new Set(group)]);
}

export function cleanAttributes(
  attributes: CreateProductAttribute[],
): CreateProductAttribute[] {
  return attributes.map((attribute) => ({
    name: attribute.name.trim(),
    options: attribute.options.map((option) => option.trim()),
  }));
}

export function combinationCount(attributes: CreateProductAttribute[]): number {
  return attributes.reduce(
    (count, attribute) => count * attribute.options.length,
    1,
  );
}

export function variantCombinations(
  attributes: CreateProductAttribute[],
): CreateProductVariantOption[][] {
  return attributes.reduce<CreateProductVariantOption[][]>(
    (rows, attribute) =>
      rows.flatMap((row) =>
        attribute.options.map((option) => [
          ...row,
          { attribute: attribute.name, option },
        ]),
      ),
    [[]],
  );
}

export function variantRowKey(options: CreateProductVariantOption[]): string {
  return JSON.stringify(
    options.map((pair) => [
      duplicateNameKey(pair.attribute),
      duplicateNameKey(pair.option),
    ]),
  );
}

export interface VariantRowEdit {
  sku?: string;
  barcode?: string;
  price?: string;
}

export interface ManualProductForm {
  name: string;
  price: number;
  sku?: string;
  attributes: CreateProductAttribute[];
}

const presentText = (value?: string) => {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? undefined : trimmed;
};

export function variantRowPrice(
  edit: VariantRowEdit | undefined,
  productPrice: number,
): number {
  const typed = presentText(edit?.price);
  return typed === undefined ? productPrice : Number(typed);
}

export function buildCreateProductPayload(
  form: ManualProductForm,
  edits: Record<string, VariantRowEdit>,
  imageUrls: string[],
): CreateProductPayload {
  const attributes = cleanAttributes(form.attributes);
  return {
    name: form.name.trim(),
    price: form.price,
    sku: presentText(form.sku),
    images: imageUrls,
    attributes,
    variants: variantCombinations(attributes).map((options) => {
      const edit = edits[variantRowKey(options)];
      return {
        options,
        sku: presentText(edit?.sku),
        barcode: presentText(edit?.barcode),
        price: variantRowPrice(edit, form.price),
      };
    }),
  };
}

export function repeatedValues(values: (string | undefined)[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const value of values) {
    if (value === undefined) continue;
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}
