'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { toast } from 'react-toastify';
import { formatStockNumber } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { isInvalidCountInput } from '@/components/stock/CountSheetTable';
import { VarianceChip } from '@/components/stock/VarianceChip';
import { VariantLabel } from '@/components/stock/VariantLabel';
import { adjustmentShortagesOf, type StockAdjustmentShortage } from '@/components/stock/stockAdjustmentErrors';
import { useEntryGrid } from '@/components/stock/useEntryGrid';
import {
  STOCK_ADJUSTMENT_REASON_LABELS,
  STOCK_ADJUSTMENT_REASON_OPTIONS,
  STOCK_ADJUSTMENT_REASON_REQUIRING_NOTE,
} from '@/components/stock/stockLabels';
import { STOCK_FIELD_CLASS, STOCK_FIELD_ERROR_CLASS, STOCK_NUMBER_FIELD_CLASS } from '@/components/stock/formStyles';
import { cn } from '@/lib/utils';
import type {
  StockAdjustmentItemDto,
  StockAdjustmentReason,
} from '@/lib/api/warehouses';
import { variantPlainLabel, type VariantDisplayItem } from '@/lib/variantOptionLabel';
import { useAdjustStockBatchMutation } from '@/services/productStock';
import { useAdjustStockMutation } from '@/services/warehouses';
import { getApiErrorMessage } from '@/utils/apiError';

export interface AdjustStockLine {
  variantId: number;
  productName: string;
  sku: string | null;
  options: VariantDisplayItem[];
  current: number;
}

export interface AdjustStockGroup {
  warehouseId: number;
  warehouseName: string;
  lines: AdjustStockLine[];
}

type AdjustStockFormProps = {
  onDone(): void;
  onCancel(): void;
} & (
  | { mode: 'single'; warehouseId: number; lines: AdjustStockLine[] }
  | { mode: 'batch'; groups: AdjustStockGroup[] }
);

const REASON_KEYS = Object.keys(STOCK_ADJUSTMENT_REASON_LABELS) as StockAdjustmentReason[];

const isStockAdjustmentReason = (value: string): value is StockAdjustmentReason =>
  (REASON_KEYS as string[]).includes(value);

const keyOf = (warehouseId: number, variantId: number) => `${warehouseId}:${variantId}`;

const isBlankCount = (raw: string) => raw.trim() === '';

const shortageNameOf = (shortage: StockAdjustmentShortage) =>
  shortage.variantLabel ? `${shortage.productName} (${shortage.variantLabel})` : shortage.productName;

export function AdjustStockForm(props: AdjustStockFormProps) {
  const { onDone, onCancel } = props;
  const groups: AdjustStockGroup[] =
    props.mode === 'single'
      ? [{ warehouseId: props.warehouseId, warehouseName: '', lines: props.lines }]
      : props.groups;
  const isBatch = props.mode === 'batch';

  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [attempted, setAttempted] = useState(false);
  const [failure, setFailure] = useState<{ shortages: StockAdjustmentShortage[] } | null>(null);
  const [refusedKeys, setRefusedKeys] = useState<Set<string>>(new Set());
  const singleMutation = useAdjustStockMutation();
  const batchMutation = useAdjustStockBatchMutation();
  const isPending = singleMutation.isPending || batchMutation.isPending;
  const orderedKeys = groups.flatMap((group) =>
    group.lines.map((line) => keyOf(group.warehouseId, line.variantId))
  );
  const { registerInput, onInputKeyDown } = useEntryGrid(orderedKeys);

  const countRawOf = (warehouseId: number, line: AdjustStockLine) =>
    counts[keyOf(warehouseId, line.variantId)] ?? String(line.current);

  const deltaOf = (warehouseId: number, line: AdjustStockLine): number | null => {
    const raw = countRawOf(warehouseId, line);
    if (isBlankCount(raw)) return 0;
    if (isInvalidCountInput(raw)) return null;
    return Number(raw) - line.current;
  };

  const changedGroups = groups
    .map((group) => ({
      warehouseId: group.warehouseId,
      adjustments: group.lines
        .map((line): StockAdjustmentItemDto | null => {
          const delta = deltaOf(group.warehouseId, line);
          return delta === null || delta === 0 ? null : { variantId: line.variantId, delta };
        })
        .filter((entry): entry is StockAdjustmentItemDto => entry !== null),
    }))
    .filter((group) => group.adjustments.length > 0);

  const hasInvalid = groups.some((group) =>
    group.lines.some((line) => {
      const raw = countRawOf(group.warehouseId, line);
      return !isBlankCount(raw) && isInvalidCountInput(raw);
    })
  );
  const needsNote = reason === STOCK_ADJUSTMENT_REASON_REQUIRING_NOTE;
  const noteMissing = needsNote && note.trim() === '';
  const changedCount = changedGroups.reduce((total, group) => total + group.adjustments.length, 0);
  const canSubmit = changedCount > 0 && !hasInvalid && !isPending;

  const onCountChange = (warehouseId: number, variantId: number, raw: string) => {
    const key = keyOf(warehouseId, variantId);
    setCounts((current) => ({ ...current, [key]: raw }));
    setRefusedKeys((current) => {
      if (!current.has(key)) return current;
      const next = new Set(current);
      next.delete(key);
      return next;
    });
  };

  const onCountReset = (warehouseId: number, variantId: number) => {
    setCounts((current) => {
      const next = { ...current };
      delete next[keyOf(warehouseId, variantId)];
      return next;
    });
  };

  const submit = async () => {
    setAttempted(true);
    if (!isStockAdjustmentReason(reason)) {
      toast.error('يرجى اختيار سبب التسوية');
      return;
    }
    if (noteMissing) {
      toast.error('يرجى كتابة ملاحظة عند اختيار سبب "أخرى"');
      return;
    }
    if (hasInvalid) {
      toast.error('العدد الفعلي يجب أن يكون رقمًا صحيحًا غير سالب');
      return;
    }
    if (changedCount === 0) {
      toast.error('لا يوجد فرق بين الكمية بالنظام والعدد الفعلي');
      return;
    }

    const trimmedNote = note.trim() ? note.trim() : null;
    try {
      if (isBatch) {
        await batchMutation.mutateAsync({
          reason,
          note: trimmedNote,
          warehouses: changedGroups,
        });
      } else {
        await singleMutation.mutateAsync({
          warehouseId: changedGroups[0].warehouseId,
          adjustments: changedGroups[0].adjustments,
          reason,
          note: trimmedNote,
        });
      }
      toast.success('تم حفظ التسوية بنجاح');
      onDone();
    } catch (err: unknown) {
      const shortages = adjustmentShortagesOf(err, isBatch ? 'batch' : 'single');
      setFailure({ shortages });
      setRefusedKeys(new Set(shortages.map((shortage) => keyOf(shortage.warehouseId, shortage.variantId))));
      toast.error(getApiErrorMessage(err, 'تعذر حفظ التسوية'), { autoClose: 8000 });
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit();
  };

  const onFormKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      if (canSubmit) void submit();
    }
  };

  return (
    <form onSubmit={onSubmit} onKeyDown={onFormKeyDown} className="flex flex-col gap-4" noValidate>
      {failure && (
        <div role="alert" className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <p className="font-semibold text-destructive">لم يُطبق أي تعديل</p>
          {failure.shortages.length > 0 && (
            <ul className="flex flex-col gap-1 text-foreground">
              {failure.shortages.map((shortage) => (
                <li key={keyOf(shortage.warehouseId, shortage.variantId)}>
                  {shortageNameOf(shortage)}: المطلوب{' '}
                  <span dir="ltr" className="tabular-nums">{formatStockNumber(shortage.required)}</span>، المتاح{' '}
                  <span dir="ltr" className="tabular-nums">{formatStockNumber(shortage.available)}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground">عدّل الأسطر المحددة ثم أعد الحفظ.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            سبب التسوية <span className="text-destructive">*</span>
          </span>
          <SearchableSelect
            options={STOCK_ADJUSTMENT_REASON_OPTIONS}
            value={reason}
            onValueChange={setReason}
            placeholder="اختر سبب التسوية"
            error={attempted && reason === '' ? 'يرجى اختيار سبب التسوية' : undefined}
          />
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            ملاحظة{needsNote && <span className="text-destructive"> *</span>}
          </span>
          <input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={needsNote ? 'اكتب سبب التسوية' : 'ملاحظة (اختياري)'}
            aria-invalid={attempted && noteMissing}
            className={cn(STOCK_FIELD_CLASS, attempted && noteMissing && STOCK_FIELD_ERROR_CLASS)}
          />
          {attempted && noteMissing && (
            <span className="text-xs text-destructive">الملاحظة مطلوبة عند اختيار &quot;أخرى&quot;</span>
          )}
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2.5 text-start font-medium">
                المنتج / المتغير
              </th>
              <th scope="col" className="px-3 py-2.5 text-start font-medium">
                بالنظام
              </th>
              <th scope="col" className="px-3 py-2.5 text-start font-medium">
                العدد الفعلي
              </th>
              <th scope="col" className="px-3 py-2.5 text-start font-medium">
                الفرق
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {groups.map((group) => (
              <GroupRows
                key={group.warehouseId}
                group={group}
                showHeader={isBatch}
                countRawOf={countRawOf}
                deltaOf={deltaOf}
                onCountChange={onCountChange}
                onCountReset={onCountReset}
                registerInput={registerInput}
                onInputKeyDown={onInputKeyDown}
                refusedKeys={refusedKeys}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          <span dir="ltr" className="font-semibold tabular-nums text-foreground">{changedCount}</span> سطر بفرق
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            إلغاء
          </Button>
          <Button type="submit" disabled={!canSubmit} loading={isPending}>
            حفظ التسوية
          </Button>
        </div>
      </div>
    </form>
  );
}

interface GroupRowsProps {
  group: AdjustStockGroup;
  showHeader: boolean;
  countRawOf(warehouseId: number, line: AdjustStockLine): string;
  deltaOf(warehouseId: number, line: AdjustStockLine): number | null;
  onCountChange(warehouseId: number, variantId: number, raw: string): void;
  onCountReset(warehouseId: number, variantId: number): void;
  registerInput(key: string): (node: HTMLInputElement | null) => void;
  onInputKeyDown(event: KeyboardEvent<HTMLInputElement>, key: string, onEscape?: () => void): void;
  refusedKeys: Set<string>;
}

function GroupRows({
  group,
  showHeader,
  countRawOf,
  deltaOf,
  onCountChange,
  onCountReset,
  registerInput,
  onInputKeyDown,
  refusedKeys,
}: GroupRowsProps) {
  return (
    <>
      {showHeader && (
        <tr className="bg-muted/30">
          <th colSpan={4} scope="colgroup" className="px-3 py-2 text-start text-xs font-semibold text-foreground">
            {group.warehouseName}
          </th>
        </tr>
      )}
      {group.lines.map((line) => {
        const raw = countRawOf(group.warehouseId, line);
        const invalid = !isBlankCount(raw) && isInvalidCountInput(raw);
        const refused = refusedKeys.has(keyOf(group.warehouseId, line.variantId));
        const delta = deltaOf(group.warehouseId, line);
        return (
          <tr key={line.variantId} className={cn(refused && 'bg-destructive/5')}>
            <td className="px-3 py-2.5 align-top">
              <VariantLabel
                productName={line.productName}
                sku={line.sku}
                options={line.options}
                size="sm"
              />
              {refused && (
                <span className="mt-0.5 block text-xs text-destructive">
                  مرفوض: لم يُطبق هذا السطر
                </span>
              )}
            </td>
            <td className="px-3 py-2.5 align-top">
              <span dir="ltr" className="font-semibold tabular-nums text-muted-foreground">
                {formatStockNumber(line.current)}
              </span>
            </td>
            <td className="px-3 py-2.5 align-top">
              <input
                ref={registerInput(keyOf(group.warehouseId, line.variantId))}
                data-entry-grid
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                dir="ltr"
                aria-label={`العدد الفعلي: ${variantPlainLabel(line)}`}
                aria-invalid={invalid}
                value={raw}
                onChange={(event) => onCountChange(group.warehouseId, line.variantId, event.target.value)}
                onKeyDown={(event) =>
                  onInputKeyDown(event, keyOf(group.warehouseId, line.variantId), () =>
                    onCountReset(group.warehouseId, line.variantId)
                  )
                }
                className={cn(
                  STOCK_NUMBER_FIELD_CLASS,
                  'w-28',
                  (invalid || refused) && STOCK_FIELD_ERROR_CLASS
                )}
              />
              {invalid && <p className="mt-1 text-xs text-destructive">رقم صحيح غير سالب</p>}
            </td>
            <td className="px-3 py-2.5 align-top">
              <VarianceChip delta={delta} />
            </td>
          </tr>
        );
      })}
    </>
  );
}
