'use client';

import { useRef, type KeyboardEvent } from 'react';
import CopyableCode from '@/components/ui/copyable-code';
import { cn } from '@/lib/utils';
import type { VariantDisplayItem } from '@/lib/variantOptionLabel';
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
}: CountSheetTableProps) {
  const inputs = useRef(new Map<number, HTMLInputElement>());
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
            const raw = valueOf(line);
            const invalid =
              isInvalidCountInput(raw) && !(allowBlank && isBlankCount(raw));
            const flagged = flaggedVariantIds.includes(line.variantId);
            const uncounted = line.uncounted ?? isBlankCount(raw);
            const showUncountedLabel =
              Boolean(uncountedLabel) && uncounted && (readOnly || isBlankCount(raw));
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
                  {flagged && (
                    <p className="mt-1 text-xs font-medium text-destructive">
                      تعذر ترحيل هذا السطر: الرصيد لا يكفي
                    </p>
                  )}
                </td>
                <td className={BODY_CELL_CLASS}>
                  <CopyableCode value={line.sku} label="نسخ كود المنتج">
                    <span dir="ltr" className="font-mono text-xs text-muted-foreground">
                      {line.sku ?? '—'}
                    </span>
                  </CopyableCode>
                </td>
                <td className={BODY_CELL_CLASS}>
                  {line.live === null ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <StockQuantityCell quantity={line.live} tone="muted" />
                  )}
                </td>
                {showExpected && (
                  <td className={BODY_CELL_CLASS}>
                    {line.expected === null ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <StockQuantityCell quantity={line.expected} tone="muted" />
                    )}
                  </td>
                )}
                <td className={BODY_CELL_CLASS}>
                  {readOnly ? (
                    uncounted && uncountedLabel ? (
                      <span className="text-gray-400">{uncountedLabel}</span>
                    ) : (
                      <span
                        dir="ltr"
                        className={cn(
                          'font-semibold tabular-nums',
                          isBlankCount(raw)
                            ? 'text-muted-foreground'
                            : 'text-foreground'
                        )}
                      >
                        {isBlankCount(raw) ? '—' : raw}
                      </span>
                    )
                  ) : (
                    <input
                      ref={(node) => registerInput(line.variantId, node)}
                      type="number"
                      inputMode="numeric"
                      dir="ltr"
                      value={raw}
                      aria-label={`العدد الفعلي ${line.productName}`}
                      aria-invalid={invalid || undefined}
                      onChange={(event) =>
                        onCountedChange(line.variantId, event.target.value)
                      }
                      onBlur={() => onCountBlur?.(line.variantId)}
                      onKeyDown={(event) => onInputKeyDown(event, index, line)}
                      className={cn(
                        'h-10 w-28 rounded-lg border bg-card px-3 text-center text-base font-semibold tabular-nums text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                        invalid ? 'border-destructive' : 'border-input'
                      )}
                    />
                  )}
                </td>
                <td className={BODY_CELL_CLASS}>
                  {showUncountedLabel ? (
                    <span className="text-gray-400">{uncountedLabel}</span>
                  ) : (
                    <VarianceChip
                      delta={
                        readOnly
                          ? (line.postedDelta ?? null)
                          : deltaOf(line, raw)
                      }
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
