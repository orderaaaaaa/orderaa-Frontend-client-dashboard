'use client';

import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import CopyableCode from '@/components/ui/copyable-code';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';
import type { VariantDisplayItem } from '@/lib/variantOptionLabel';
import { isFiniteNumber } from '@/utils/format';
import { StockQuantityCell } from './StockQuantityCell';
import { VariantLabel } from './VariantLabel';
import { VarianceChip } from './VarianceChip';

export interface CountSheetLine {
  variantId: number;
  productName: string;
  sku: string | null;
  options: VariantDisplayItem[];
  optionsLabel?: string;
  live: number | null;
  expected: number | null;
  postedDelta?: number | null;
  uncounted?: boolean;
}

export const isInvalidCountInput = (raw: string) => {
  if (raw.trim() === '') return true;
  const value = Number(raw);
  return !Number.isInteger(value) || value < 0;
};

const referenceOf = (line: CountSheetLine) => line.live ?? line.expected;

const isBlankCount = (raw: string) => raw.trim() === '';

const deltaOf = (line: CountSheetLine, raw: string): number | null => {
  const reference = referenceOf(line);
  if (reference === null || isInvalidCountInput(raw)) return null;
  return Number(raw) - reference;
};

const HEADER_CELL_CLASS = 'px-3 py-2.5 text-start text-xs font-semibold text-muted-foreground';
const BODY_CELL_CLASS = 'px-3 py-2.5 align-middle';
const MOBILE_BREAKPOINT = 768;

const quantityNodeOf = (quantity: number | null) =>
  quantity === null ? (
    <span className="text-muted-foreground">—</span>
  ) : (
    <StockQuantityCell quantity={quantity} tone="muted" />
  );

const skuNodeOf = (sku: string | null) => (
  <CopyableCode value={sku} label="نسخ كود المنتج">
    <span dir="ltr" className="font-mono text-xs text-muted-foreground">
      {sku ?? '—'}
    </span>
  </CopyableCode>
);

interface CountSheetTableProps {
  lines: CountSheetLine[];
  valueOf(line: CountSheetLine): string;
  onCountedChange(variantId: number, raw: string): void;
  onCancelEdit?(variantId: number): void;
  onCountBlur?(variantId: number): void;
  onSave(): void;
  allowBlank?: boolean;
  readOnly?: boolean;
  flaggedVariantIds?: number[];
  uncountedLabel?: string;
  varianceUnavailable?: boolean;
  mobileCards?: boolean;
}

export function CountSheetTable({
  lines,
  valueOf,
  onCountedChange,
  onCancelEdit,
  onCountBlur,
  onSave,
  allowBlank = false,
  readOnly = false,
  flaggedVariantIds = [],
  uncountedLabel,
  varianceUnavailable = false,
  mobileCards = false,
}: CountSheetTableProps) {
  const inputs = useRef(new Map<number, HTMLInputElement>());
  const isMobile = useIsMobile(MOBILE_BREAKPOINT);
  const showCards = mobileCards && isMobile;
  const showExpected = lines.some((line) => line.expected !== null);

  const registerInput = (variantId: number, node: HTMLInputElement | null) => {
    if (node) inputs.current.set(variantId, node);
    else inputs.current.delete(variantId);
  };

  const focusLine = (index: number) => {
    const target = lines[index];
    if (!target) return;
    const node = inputs.current.get(target.variantId);
    node?.focus();
    node?.select();
  };

  const onContainerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      onSave();
    }
  };

  const onInputKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
    line: CountSheetLine
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      focusLine(index + 1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusLine(index + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusLine(index - 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onCancelEdit?.(line.variantId);
    }
  };

  const stateOf = (line: CountSheetLine) => {
    const raw = valueOf(line);
    const invalid = isInvalidCountInput(raw) && !(allowBlank && isBlankCount(raw));
    const flagged = flaggedVariantIds.includes(line.variantId);
    const uncounted = line.uncounted ?? isBlankCount(raw);
    const showUncountedLabel =
      Boolean(uncountedLabel) && uncounted && (readOnly || isBlankCount(raw));
    const varianceDelta = !readOnly
      ? deltaOf(line, raw)
      : isFiniteNumber(line.postedDelta) || !uncountedLabel
        ? (line.postedDelta ?? null)
        : deltaOf(line, raw);
    return { raw, invalid, flagged, uncounted, showUncountedLabel, varianceDelta };
  };

  const countNodeOf = (
    line: CountSheetLine,
    index: number,
    raw: string,
    invalid: boolean,
    uncounted: boolean
  ): ReactNode => {
    if (!readOnly) {
      return (
        <input
          ref={(node) => registerInput(line.variantId, node)}
          type="number"
          inputMode="numeric"
          dir="ltr"
          value={raw}
          aria-label={`العدد الفعلي ${line.productName}`}
          aria-invalid={invalid || undefined}
          onChange={(event) => onCountedChange(line.variantId, event.target.value)}
          onBlur={() => onCountBlur?.(line.variantId)}
          onKeyDown={(event) => onInputKeyDown(event, index, line)}
          className={cn(
            'h-10 w-28 rounded-lg border bg-card px-3 text-center text-base font-semibold tabular-nums text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
            invalid ? 'border-destructive' : 'border-input'
          )}
        />
      );
    }
    return uncounted && uncountedLabel ? (
      <span className="text-gray-400">{uncountedLabel}</span>
    ) : (
      <span
        dir="ltr"
        className={cn(
          'font-semibold tabular-nums',
          isBlankCount(raw) ? 'text-muted-foreground' : 'text-foreground'
        )}
      >
        {isBlankCount(raw) ? '—' : raw}
      </span>
    );
  };

  const varianceNodeOf = (varianceDelta: number | null, showUncountedLabel: boolean): ReactNode =>
    varianceUnavailable ? (
      <span className="text-gray-400">—</span>
    ) : showUncountedLabel ? (
      <span className="text-gray-400">{uncountedLabel}</span>
    ) : (
      <VarianceChip delta={varianceDelta} />
    );

  const flaggedNodeOf = (flagged: boolean) =>
    flagged && (
      <p className="mt-1 text-xs font-medium text-destructive">
        تعذر ترحيل هذا السطر: الرصيد لا يكفي
      </p>
    );

  if (showCards) {
    return (
      <div className="flex flex-col gap-3" onKeyDown={onContainerKeyDown}>
        {lines.map((line, index) => {
          const { raw, invalid, flagged, uncounted, showUncountedLabel, varianceDelta } =
            stateOf(line);
          return (
            <div
              key={line.variantId}
              className={cn(
                'flex flex-col gap-3 rounded-xl border border-border bg-card p-4',
                flagged && 'bg-destructive/5'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <VariantLabel
                  productName={line.productName}
                  sku={line.sku}
                  options={line.options}
                  optionsLabel={line.optionsLabel}
                  size="sm"
                />
                <div className="shrink-0 text-sm">
                  {varianceNodeOf(varianceDelta, showUncountedLabel)}
                </div>
              </div>
              {flaggedNodeOf(flagged)}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xs text-muted-foreground">SKU</span>
                {skuNodeOf(line.sku)}
              </div>
              <div
                className={cn(
                  'grid gap-3 text-sm',
                  showExpected ? 'grid-cols-2' : 'grid-cols-1'
                )}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">الكمية بالنظام</span>
                  {quantityNodeOf(line.live)}
                </div>
                {showExpected && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">المتوقع عند البدء</span>
                    {quantityNodeOf(line.expected)}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                <span className="text-sm font-medium text-foreground">العدد الفعلي</span>
                {countNodeOf(line, index, raw, invalid, uncounted)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-xl border border-border bg-card"
      onKeyDown={onContainerKeyDown}
    >
      <table className="w-full min-w-[32rem] text-sm">
        <thead className="bg-muted/50">
          <tr className="border-b border-border">
            <th scope="col" className={HEADER_CELL_CLASS}>
              المنتج / المتغير
            </th>
            <th scope="col" className={HEADER_CELL_CLASS}>
              SKU
            </th>
            <th scope="col" className={HEADER_CELL_CLASS}>
              الكمية بالنظام
            </th>
            {showExpected && (
              <th scope="col" className={HEADER_CELL_CLASS}>
                المتوقع عند البدء
              </th>
            )}
            <th scope="col" className={HEADER_CELL_CLASS}>
              العدد الفعلي
            </th>
            <th scope="col" className={HEADER_CELL_CLASS}>
              الفرق
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => {
            const { raw, invalid, flagged, uncounted, showUncountedLabel, varianceDelta } =
              stateOf(line);
            return (
              <tr
                key={line.variantId}
                className={cn(
                  'border-b border-border last:border-b-0 transition-colors hover:bg-muted/40',
                  flagged && 'bg-destructive/5'
                )}
              >
                <td className={BODY_CELL_CLASS}>
                  <VariantLabel
                    productName={line.productName}
                    sku={line.sku}
                    options={line.options}
                    optionsLabel={line.optionsLabel}
                    size="sm"
                  />
                  {flaggedNodeOf(flagged)}
                </td>
                <td className={BODY_CELL_CLASS}>{skuNodeOf(line.sku)}</td>
                <td className={BODY_CELL_CLASS}>{quantityNodeOf(line.live)}</td>
                {showExpected && (
                  <td className={BODY_CELL_CLASS}>{quantityNodeOf(line.expected)}</td>
                )}
                <td className={BODY_CELL_CLASS}>
                  {countNodeOf(line, index, raw, invalid, uncounted)}
                </td>
                <td className={BODY_CELL_CLASS}>
                  {varianceNodeOf(varianceDelta, showUncountedLabel)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
