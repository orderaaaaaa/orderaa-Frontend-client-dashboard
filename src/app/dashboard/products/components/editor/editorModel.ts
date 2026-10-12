import type {
  AttributeManual,
  ProductDetail,
  ProductDetailVariant,
  SpecificationInput,
  UpdateProductScalarsPayload,
  UpsertVariantInput,
} from '../../types/products';
import { PRODUCT_CREATE_LIMITS, PRODUCT_EDIT_LIMITS } from '../../types/products';
import { duplicateNameKey, duplicateNames } from '../../utils/manualProduct';

let keySeed = 0;
export const nextKey = (prefix: string) => {
  keySeed += 1;
  return `${prefix}-${keySeed}`;
};

export interface BasicDraft {
  name: string;
  sku: string;
  price: string;
}

export type GalleryItem =
  | { key: string; kind: 'url'; url: string }
  | { key: string; kind: 'file'; file: File; preview: string };

export interface OptionDraft {
  key: string;
  id?: number;
  name: string;
}

export interface AttributeDraft {
  key: string;
  id?: number;
  name: string;
  options: OptionDraft[];
}

export interface VariantEdit {
  sku: string;
  barcode: string;
  price: string;
  image: string | null;
}

export interface NewVariantRow extends VariantEdit {
  key: string;
  optionByAttribute: Record<number, number | undefined>;
}

export interface SpecRow {
  key: string;
  name: string;
  value: string;
}

export const basicFromDetail = (detail: ProductDetail): BasicDraft => ({
  name: detail.name,
  sku: detail.sku ?? '',
  price: detail.price === null ? '' : String(detail.price),
});

export const galleryFromDetail = (detail: ProductDetail): GalleryItem[] =>
  detail.images.map((url, index) => ({ key: `saved-${index}-${url}`, kind: 'url', url }));

export const attributesFromDetail = (detail: ProductDetail): AttributeDraft[] =>
  detail.attributes.map((attribute) => ({
    key: `attr-${attribute.id}`,
    id: attribute.id,
    name: attribute.name,
    options: attribute.options.map((option) => ({
      key: `opt-${option.id}`,
      id: option.id,
      name: option.name,
    })),
  }));

export const specsFromDetail = (detail: ProductDetail): SpecRow[] =>
  detail.specifications.map((spec, index) => ({
    key: `spec-${index}`,
    name: spec.name,
    value: spec.value,
  }));

export const variantEditFromDetail = (
  variant: ProductDetailVariant,
): VariantEdit => ({
  sku: variant.sku ?? '',
  barcode: variant.barcode ?? '',
  price: variant.price === null ? '' : String(variant.price),
  image: variant.image,
});

export const sameVariantEdit = (a: VariantEdit, b: VariantEdit) =>
  a.sku.trim() === b.sku.trim() &&
  a.barcode.trim() === b.barcode.trim() &&
  a.price.trim() === b.price.trim() &&
  a.image === b.image;

export const sameBasic = (a: BasicDraft, b: BasicDraft) =>
  a.name.trim() === b.name.trim() &&
  a.sku.trim() === b.sku.trim() &&
  a.price.trim() === b.price.trim();

export const galleryUrls = (items: GalleryItem[]) =>
  items.flatMap((item) => (item.kind === 'url' ? [item.url] : []));

export const sameGallery = (items: GalleryItem[], detail: ProductDetail) =>
  items.every((item) => item.kind === 'url') &&
  items.length === detail.images.length &&
  galleryUrls(items).every((url, index) => url === detail.images[index]);

const attributeSignature = (attributes: AttributeDraft[]) =>
  JSON.stringify(
    attributes.map((attribute) => [
      attribute.id ?? null,
      attribute.name.trim(),
      attribute.options.map((option) => [option.id ?? null, option.name.trim()]),
    ]),
  );

export const sameAttributes = (a: AttributeDraft[], b: AttributeDraft[]) =>
  attributeSignature(a) === attributeSignature(b);

const specSignature = (rows: SpecRow[]) =>
  JSON.stringify(
    rows
      .filter((row) => row.name.trim() || row.value.trim())
      .map((row) => [row.name.trim(), row.value.trim()]),
  );

export const sameSpecs = (a: SpecRow[], b: SpecRow[]) =>
  specSignature(a) === specSignature(b);

export interface BasicErrors {
  name?: string;
  sku?: string;
  price?: string;
}

export function validateBasic(
  draft: BasicDraft,
  detail: ProductDetail,
): BasicErrors {
  const errors: BasicErrors = {};
  if (!draft.name.trim()) errors.name = 'اسم المنتج مطلوب';
  const price = draft.price.trim();
  if (price === '') {
    if (detail.price !== null) errors.price = 'السعر مطلوب';
  } else if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
    errors.price = 'السعر يجب أن يكون رقماً أكبر من 0';
  }
  return errors;
}

export function buildScalarsPayload(
  draft: BasicDraft,
  detail: ProductDetail,
  images: string[] | undefined,
): UpdateProductScalarsPayload {
  const payload: UpdateProductScalarsPayload = {};
  const saved = basicFromDetail(detail);
  if (draft.name.trim() !== saved.name.trim()) payload.name = draft.name.trim();
  if (draft.sku.trim() !== saved.sku.trim()) {
    payload.sku = draft.sku.trim() === '' ? null : draft.sku.trim();
  }
  if (draft.price.trim() !== saved.price.trim() && draft.price.trim() !== '') {
    payload.price = Number(draft.price.trim());
  }
  if (images !== undefined) payload.images = images;
  return payload;
}

export interface AttributeErrors {
  section?: string;
  byKey: Record<string, { name?: string; values?: string }>;
}

export function validateAttributes(
  attributes: AttributeDraft[],
  savedCount: number,
): AttributeErrors {
  const errors: AttributeErrors = { byKey: {} };
  if (attributes.length === 0 && savedCount > 0) {
    errors.section =
      'لا يمكن حذف كل الخصائص من هنا، اترك خاصية واحدة على الأقل';
    return errors;
  }
  if (attributes.length > PRODUCT_CREATE_LIMITS.attributes) {
    errors.section = `الحد الأقصى ${PRODUCT_CREATE_LIMITS.attributes} خصائص`;
  }
  const repeated = new Set(
    duplicateNames(attributes.map((attribute) => attribute.name)).map(
      duplicateNameKey,
    ),
  );
  for (const attribute of attributes) {
    const entry: { name?: string; values?: string } = {};
    if (!attribute.name.trim()) entry.name = 'اسم الخاصية مطلوب';
    else if (repeated.has(duplicateNameKey(attribute.name))) {
      entry.name = 'اسم الخاصية مكرر';
    }
    if (attribute.options.length === 0) {
      entry.values = 'أضف قيمة واحدة على الأقل';
    } else if (
      attribute.options.length > PRODUCT_CREATE_LIMITS.optionsPerAttribute
    ) {
      entry.values = `الحد الأقصى ${PRODUCT_CREATE_LIMITS.optionsPerAttribute} قيمة`;
    } else {
      const repeatedOptions = duplicateNames(
        attribute.options.map((option) => option.name),
      );
      if (repeatedOptions.length > 0) {
        entry.values = `قيم مكررة: ${repeatedOptions.join('، ')}`;
      }
    }
    if (entry.name || entry.values) errors.byKey[attribute.key] = entry;
  }
  return errors;
}

export const hasAttributeErrors = (errors: AttributeErrors) =>
  !!errors.section || Object.keys(errors.byKey).length > 0;

export const buildAttributesPayload = (
  attributes: AttributeDraft[],
): AttributeManual[] =>
  attributes.map((attribute) => ({
    ...(attribute.id !== undefined ? { id: attribute.id } : {}),
    name: attribute.name.trim(),
    options: attribute.options.map((option) => ({
      ...(option.id !== undefined ? { id: option.id } : {}),
      name: option.name.trim(),
    })),
  }));

export interface SpecErrors {
  section?: string;
  byKey: Record<string, string>;
}

export function validateSpecs(rows: SpecRow[]): SpecErrors {
  const errors: SpecErrors = { byKey: {} };
  const filled = rows.filter((row) => row.name.trim() || row.value.trim());
  if (filled.length > PRODUCT_EDIT_LIMITS.specifications) {
    errors.section = `الحد الأقصى ${PRODUCT_EDIT_LIMITS.specifications} مواصفة`;
  }
  const seen = new Set<string>();
  for (const row of filled) {
    const name = row.name.trim();
    const value = row.value.trim();
    if (!name) errors.byKey[row.key] = 'اكتب اسم المواصفة';
    else if (!value) errors.byKey[row.key] = 'اكتب قيمة المواصفة';
    else if (name.length > PRODUCT_EDIT_LIMITS.specificationName) {
      errors.byKey[row.key] = `اسم المواصفة أطول من ${PRODUCT_EDIT_LIMITS.specificationName} حرف`;
    } else if (value.length > PRODUCT_EDIT_LIMITS.specificationValue) {
      errors.byKey[row.key] = `القيمة أطول من ${PRODUCT_EDIT_LIMITS.specificationValue} حرف`;
    } else if (seen.has(name)) {
      errors.byKey[row.key] = 'اسم المواصفة مكرر';
    }
    seen.add(name);
  }
  return errors;
}

export const hasSpecErrors = (errors: SpecErrors) =>
  !!errors.section || Object.keys(errors.byKey).length > 0;

export const buildSpecsPayload = (rows: SpecRow[]): SpecificationInput[] =>
  rows
    .filter((row) => row.name.trim() || row.value.trim())
    .map((row) => ({ name: row.name.trim(), value: row.value.trim() }));

export interface VariantRowRef {
  key: string;
  variantId?: number;
}

export interface VariantPlan {
  payload: UpsertVariantInput[];
  rows: VariantRowRef[];
}

const priceValue = (price: string): number | null =>
  price.trim() === '' ? null : Number(price.trim());

const textValue = (value: string): string | null =>
  value.trim() === '' ? null : value.trim();

export const existingRowKey = (variantId: number) => `variant-${variantId}`;

export function validateVariants(
  detail: ProductDetail,
  edits: Record<number, VariantEdit>,
  newRows: NewVariantRow[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  const displayed: { key: string; edit: VariantEdit }[] = [
    ...detail.variants.map((variant) => ({
      key: existingRowKey(variant.id),
      edit: edits[variant.id] ?? variantEditFromDetail(variant),
    })),
    ...newRows.map((row) => ({ key: row.key, edit: row })),
  ];

  const skuOwners = new Map<string, string[]>();
  const barcodeOwners = new Map<string, string[]>();
  for (const { key, edit } of displayed) {
    const price = edit.price.trim();
    if (price !== '' && (!Number.isFinite(Number(price)) || Number(price) < 0)) {
      errors[key] = 'السعر يجب أن يكون رقماً أكبر من أو يساوي 0';
    }
    const sku = edit.sku.trim();
    if (sku) skuOwners.set(sku, [...(skuOwners.get(sku) ?? []), key]);
    const barcode = edit.barcode.trim();
    if (barcode) {
      barcodeOwners.set(barcode, [...(barcodeOwners.get(barcode) ?? []), key]);
    }
  }
  for (const [sku, keys] of skuOwners) {
    if (keys.length > 1) {
      keys.forEach((key) => {
        errors[key] ??= `رمز SKU مكرر: ${sku}`;
      });
    }
  }
  for (const [barcode, keys] of barcodeOwners) {
    if (keys.length > 1) {
      keys.forEach((key) => {
        errors[key] ??= `الباركود مكرر: ${barcode}`;
      });
    }
  }

  const combinations = new Map<string, string>(
    detail.variants.map((variant) => [
      [...variant.optionIds].sort((a, b) => a - b).join('-'),
      existingRowKey(variant.id),
    ]),
  );
  for (const row of newRows) {
    const optionIds = detail.attributes.map(
      (attribute) => row.optionByAttribute[attribute.id],
    );
    if (optionIds.some((id) => id === undefined)) {
      errors[row.key] ??= 'اختر قيمة لكل خاصية';
      continue;
    }
    const combination = (optionIds as number[])
      .slice()
      .sort((a, b) => a - b)
      .join('-');
    if (combinations.has(combination)) {
      errors[row.key] ??= 'يوجد متغير بنفس القيم';
      continue;
    }
    combinations.set(combination, row.key);
  }
  return errors;
}

export function buildVariantPlan(
  detail: ProductDetail,
  edits: Record<number, VariantEdit>,
  newRows: NewVariantRow[],
): VariantPlan {
  const plan: VariantPlan = { payload: [], rows: [] };
  for (const variant of detail.variants) {
    const edit = edits[variant.id];
    if (!edit) continue;
    const saved = variantEditFromDetail(variant);
    if (sameVariantEdit(edit, saved)) continue;
    const entry: UpsertVariantInput = { id: variant.id };
    if (edit.sku.trim() !== saved.sku.trim()) entry.sku = textValue(edit.sku);
    if (edit.barcode.trim() !== saved.barcode.trim()) {
      entry.barcode = textValue(edit.barcode);
    }
    if (edit.price.trim() !== saved.price.trim()) {
      entry.price = priceValue(edit.price);
    }
    if (edit.image !== saved.image) entry.image = edit.image;
    plan.payload.push(entry);
    plan.rows.push({ key: existingRowKey(variant.id), variantId: variant.id });
  }
  for (const row of newRows) {
    const entry: UpsertVariantInput = {
      optionIds: detail.attributes
        .map((attribute) => row.optionByAttribute[attribute.id])
        .filter((id): id is number => id !== undefined),
    };
    const sku = textValue(row.sku);
    const barcode = textValue(row.barcode);
    const price = priceValue(row.price);
    if (sku !== null) entry.sku = sku;
    if (barcode !== null) entry.barcode = barcode;
    if (price !== null) entry.price = price;
    if (row.image !== null) entry.image = row.image;
    plan.payload.push(entry);
    plan.rows.push({ key: row.key });
  }
  return plan;
}

export const emptyNewVariantRow = (): NewVariantRow => ({
  key: nextKey('new-variant'),
  optionByAttribute: {},
  sku: '',
  barcode: '',
  price: '',
  image: null,
});

export const isStoreLinked = (detail: ProductDetail) =>
  detail.externalSources.length > 0;
