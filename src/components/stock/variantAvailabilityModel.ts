import type { AvailabilityRefusal, VariantAvailability } from '@/lib/api/warehouses';
import type { VariantOption } from '@/services/orders';
import { readStoredLocale } from '@/i18n/locale';
import { translate } from '@/i18n/translate';
import type { AvailableStockRefusalLine } from '@/lib/api/stockShortage';
import { formatAvailableStockLines } from '@/utils/apiError';

export interface CatalogOption {
  optionId: number;
  optionName: string;
}

export interface CatalogAttribute {
  attributeId: number;
  attributeName: string;
  options: CatalogOption[];
}

export type Selection = Record<number, number>;

export function selectionFromNames(
  groups: VariantOption[],
  values: Readonly<Record<string, string>>,
): Selection {
  const selection: Selection = {};
  for (const group of groups) {
    const option = group.options.find((item) => item.name === values[group.attribute]);
    if (option) selection[group.attributeId] = option.id;
  }
  return selection;
}

export function namesFromSelection(
  groups: VariantOption[],
  selection: Selection,
): Record<string, string> {
  const names: Record<string, string> = {};
  for (const group of groups) {
    const option = group.options.find((item) => item.id === selection[group.attributeId]);
    if (option) names[group.attribute] = option.name;
  }
  return names;
}

export function catalogAttributesOf(groups: VariantOption[]): CatalogAttribute[] {
  return groups.map((group) => ({
    attributeId: group.attributeId,
    attributeName: group.displayName || group.attribute,
    options: group.options.map((option) => ({
      optionId: option.id,
      optionName: option.displayName || option.name,
    })),
  }));
}

export type OptionState = 'ok' | 'low' | 'out' | 'notSet' | 'unknown';

export interface OptionStatus {
  state: OptionState;
  best: number | null;
  required: number | null;
  selected: boolean;
}

export const unknownOptionStatus = (selected: boolean): OptionStatus => ({
  state: 'unknown',
  best: null,
  required: null,
  selected,
});

const byName = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

export function sortedCatalog(attributes: CatalogAttribute[]): CatalogAttribute[] {
  return [...attributes]
    .sort(
      (a, b) =>
        byName(a.attributeName, b.attributeName) || a.attributeId - b.attributeId,
    )
    .map((attribute) => ({
      ...attribute,
      options: [...attribute.options].sort(
        (a, b) => byName(a.optionName, b.optionName) || a.optionId - b.optionId,
      ),
    }));
}

export function comboKeyOf(optionIds: readonly number[]): string {
  return [...optionIds].sort((a, b) => a - b).join('-');
}

export function optionStatus({
  variants,
  attribute,
  optionId,
  selection,
}: {
  variants: VariantAvailability[];
  attribute: CatalogAttribute;
  optionId: number;
  selection: Selection;
}): OptionStatus {
  const selected = selection[attribute.attributeId] === optionId;
  const otherSelections = Object.entries(selection)
    .filter(([attributeId]) => Number(attributeId) !== attribute.attributeId)
    .map(([, selectedOptionId]) => selectedOptionId);
  const candidates = variants.filter(
    (variant) =>
      variant.options.some((option) => option.optionId === optionId) &&
      otherSelections.every((selectedOptionId) =>
        variant.options.some((option) => option.optionId === selectedOptionId),
      ),
  );
  const measured = candidates.filter((variant) => variant.available !== null);

  if (measured.length === 0) {
    const noWarehouse =
      variants.length > 0 && variants.every((variant) => variant.available === null);
    return {
      state: noWarehouse ? 'notSet' : 'out',
      best: null,
      required: null,
      selected,
    };
  }

  const covered = measured.some(
    (variant) => (variant.available ?? 0) >= variant.required,
  );
  const pool = covered
    ? measured.filter((variant) => (variant.available ?? 0) >= variant.required)
    : measured;
  const bestRow = pool.reduce((best, variant) =>
    (variant.available ?? 0) > (best.available ?? 0) ? variant : best,
  );
  const best = bestRow.available ?? 0;
  const state: OptionState = covered ? 'ok' : best > 0 ? 'low' : 'out';
  return { state, best, required: bestRow.required, selected };
}

export function exactVariantFor(
  variants: VariantAvailability[],
  selection: Selection,
  attributeCount: number,
): VariantAvailability | null {
  const selectedIds = Object.values(selection);
  if (selectedIds.length === 0 || selectedIds.length !== attributeCount) return null;
  return (
    variants.find(
      (variant) =>
        variant.options.length === attributeCount &&
        selectedIds.every((optionId) =>
          variant.options.some((option) => option.optionId === optionId),
        ),
    ) ?? null
  );
}

export function selectionLabel(
  attributes: CatalogAttribute[],
  selection: Selection,
): string | null {
  const sorted = sortedCatalog(attributes);
  if (sorted.length === 0) return null;
  const names: string[] = [];
  for (const attribute of sorted) {
    const optionId = selection[attribute.attributeId];
    const option = attribute.options.find((item) => item.optionId === optionId);
    if (!option) return null;
    names.push(option.optionName);
  }
  return names.join(' / ');
}

export const probeQuantityOf = (quantity: number) => Math.min(Math.max(quantity, 1), 99);

export interface DraftSummary {
  draft: Record<string, number>;
  excluded: number;
}

export function draftFromLines(
  lines: { optionIds: number[]; quantity: number }[],
  attributeCount: number,
): DraftSummary {
  const draft: Record<string, number> = {};
  let excluded = 0;
  for (const line of lines) {
    if (line.optionIds.length === 0 || line.optionIds.length !== attributeCount) {
      excluded += 1;
      continue;
    }
    if (line.quantity < 1) continue;
    const key = comboKeyOf(line.optionIds);
    draft[key] = Math.min((draft[key] ?? 0) + line.quantity, 99);
  }
  return { draft, excluded };
}

export function availableRefusalLineOf(
  productName: string,
  row: {
    variantId: number;
    variantLabel: string;
    available: number;
    change: number;
    after: number | null;
  },
): AvailableStockRefusalLine {
  return {
    variantId: row.variantId,
    productName,
    variantLabel: row.variantLabel,
    available: row.available,
    change: row.change,
    after: row.after ?? row.available + row.change,
  };
}

function availableLineOf(
  productName: string,
  row: VariantAvailability,
): AvailableStockRefusalLine | null {
  if (row.available === null) return null;
  return availableRefusalLineOf(productName, { ...row, available: row.available });
}

export function refusalTextFor({
  refusal,
  productName,
  row,
}: {
  refusal: AvailabilityRefusal;
  productName: string;
  row: VariantAvailability;
}): string {
  const locale = readStoredLocale();
  const line = availableLineOf(productName, row);
  if (refusal === 'AVAILABLE_WAREHOUSE_NOT_SET' || line === null) {
    return translate(locale, 'orderDetails.stock.availableWarehouseNotSet');
  }
  const heading = translate(locale, 'stockShortage.availableWouldGoNegative', {
    warehouse: row.availableWarehouse?.name ?? '',
  });
  return `${heading}\n${formatAvailableStockLines([line])}`;
}

export function warningTextFor({
  productName,
  row,
}: {
  productName: string;
  row: VariantAvailability;
}): string | null {
  const line = availableLineOf(productName, row);
  if (!row.warning || line === null) return null;
  const heading = translate(readStoredLocale(), 'stockShortage.availableWarning', {
    warehouse: row.availableWarehouse?.name ?? '',
  });
  return `${heading}\n${formatAvailableStockLines([line])}`;
}
