'use client';

import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StockQuantityCell } from '@/components/stock/StockQuantityCell';
import { VariantLabel } from '@/components/stock/VariantLabel';
import { WarehouseSelect } from '@/components/stock/WarehouseSelect';
import { STOCK_FIELD_CLASS, STOCK_FIELD_ERROR_CLASS, STOCK_NUMBER_FIELD_CLASS } from '@/components/stock/formStyles';
import { useEntryGrid } from '@/components/stock/useEntryGrid';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { readStoredLocale } from '@/i18n/locale';
import { translate } from '@/i18n/translate';
import { PERMISSION_CODES } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { variantPlainLabel, type VariantDisplayItem } from '@/lib/variantOptionLabel';
import { useStockWarehouseOptions } from '@/services/productStock';
import { invalidateStockViews, useTransferStockMutation } from '@/services/warehouses';
import {
  formatStockShortageLines,
  getApiErrorMessage,
  getTransferShortageLines,
  isTransferWarehouseNotAllowed,
} from '@/utils/apiError';

export interface MoveStockLine {
  variantId: number;
  productName: string;
  sku: string | null;
  options: VariantDisplayItem[];
  available: number;
}

export interface MoveStockDestination {
  id: number | null;
  onChange(id: number | null): void;
}

interface MoveStockFormProps {
  fromWarehouseId: number;
  lines: MoveStockLine[];
  destination?: MoveStockDestination;
  onDone(): void;
  onCancel(): void;
  onRemoveLine?(variantId: number): void;
  onShortage?(lines: { variantId: number; available: number }[]): void;
}

export function MoveStockForm({
  fromWarehouseId,
  lines,
  destination,
  onDone,
  onCancel,
  onRemoveLine,
  onShortage,
}: MoveStockFormProps) {
  const [internalToWarehouseId, setInternalToWarehouseId] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [note, setNote] = useState('');
  const [attempted, setAttempted] = useState(false);
  const submittingRef = useRef(false);
  const canReadWarehouses = useHasPermissionStrict(PERMISSION_CODES.WAREHOUSES_STOCK_READ);
  const destinations = useStockWarehouseOptions({ enabled: canReadWarehouses });
  const queryClient = useQueryClient();
  const transferMutation = useTransferStockMutation();
  const { registerInput, onInputKeyDown } = useEntryGrid(
    lines.map((line) => String(line.variantId))
  );

  const toWarehouseId = destination ? destination.id : internalToWarehouseId;
  const setToWarehouseId = (id: number | null) =>
    destination ? destination.onChange(id) : setInternalToWarehouseId(id);

  const destinationSource = {
    ...destinations,
    pickerOptions: destinations.movePickerOptions.filter(
      (option) => option.key !== String(fromWarehouseId)
    ),
  };

  const rawOf = (line: MoveStockLine) => (quantities[line.variantId] ?? '').trim();

  const quantityOf = (line: MoveStockLine) => {
    const raw = rawOf(line);
    return raw === '' ? 0 : Number(raw);
  };

  const invalidOf = (line: MoveStockLine) => {
    const raw = rawOf(line);
    if (raw === '') return false;
    const quantity = Number(raw);
    return !Number.isInteger(quantity) || quantity < 0;
  };

  const overAvailableOf = (line: MoveStockLine) =>
    !invalidOf(line) && quantityOf(line) > line.available;

  const movingLines = lines.filter((line) => !invalidOf(line) && quantityOf(line) > 0);
  const movingTotal = movingLines.reduce((total, line) => total + quantityOf(line), 0);
  const hasInvalid = lines.some(invalidOf);
  const hasOverAvailable = lines.some(overAvailableOf);
  const canSubmit =
    toWarehouseId !== null &&
    movingLines.length > 0 &&
    !hasInvalid &&
    !hasOverAvailable &&
    !transferMutation.isPending;

  const submit = async () => {
    if (submittingRef.current) return;
    setAttempted(true);
    if (toWarehouseId === null) {
      toast.error('يرجى اختيار مخزن الوجهة');
      return;
    }
    if (hasInvalid) {
      toast.error('الكمية المنقولة يجب أن تكون رقمًا صحيحًا غير سالب');
      return;
    }
    if (movingLines.length === 0) {
      toast.error('يرجى إدخال كمية للنقل');
      return;
    }
    if (hasOverAvailable) {
      const overAvailable = lines.filter(overAvailableOf);
      toast.error(
        `${translate(readStoredLocale(), 'stockShortage.transferOverAvailable')}\n${formatStockShortageLines(
          overAvailable.map((line) => ({
            variantId: line.variantId,
            productName: line.productName,
            variantLabel: variantPlainLabel(line),
            required: quantityOf(line),
            available: line.available,
          }))
        )}`,
        { autoClose: 8000 }
      );
      return;
    }

    submittingRef.current = true;
    try {
      await transferMutation.mutateAsync({
        fromWarehouseId,
        toWarehouseId,
        items: movingLines.map((line) => ({
          variantId: line.variantId,
          quantity: quantityOf(line),
        })),
        note: note.trim() ? note.trim() : undefined,
      });
      toast.success('تم نقل المخزون بنجاح');
      onDone();
    } catch (err: unknown) {
      if (isTransferWarehouseNotAllowed(err)) {
        setToWarehouseId(null);
        setAttempted(false);
      }
      void invalidateStockViews(queryClient);
      const shortage = getTransferShortageLines(err);
      if (shortage) onShortage?.(shortage);
      toast.error(getApiErrorMessage(err, 'تعذر نقل المخزون'), { autoClose: 8000 });
    } finally {
      submittingRef.current = false;
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
    <form onSubmit={onSubmit} onKeyDown={onFormKeyDown} className="@container flex flex-col gap-4" noValidate>
      {destination ? (
        destination.id === null && (
          <p className="text-sm text-muted-foreground">اختر مخزن الوجهة لتنفيذ النقل</p>
        )
      ) : (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            إلى مخزن <span className="text-destructive">*</span>
          </span>
          {canReadWarehouses ? (
            <WarehouseSelect
              value={toWarehouseId}
              onChange={setToWarehouseId}
              source={destinationSource}
              disabledIds={[fromWarehouseId]}
              placeholder="اختر مخزن الوجهة"
            />
          ) : (
            <p className="text-sm text-muted-foreground">ليس لديك صلاحية عرض المخازن.</p>
          )}
          {attempted && toWarehouseId === null && (
            <p className="text-xs text-destructive">يرجى اختيار مخزن الوجهة</p>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="hidden bg-muted/50 px-3 py-2.5 text-sm font-medium text-muted-foreground @md:grid @md:grid-cols-[minmax(0,1fr)_auto_auto_auto] @md:items-center @md:gap-3">
          <span>المنتج / المتغير</span>
          <span>المتاح</span>
          <span>الكمية المنقولة</span>
          <span className="sr-only">الإجراءات</span>
        </div>
        <ul className="divide-y divide-border">
          {lines.map((line) => {
            const invalid = invalidOf(line);
            const over = overAvailableOf(line);
            return (
              <li
                key={line.variantId}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 gap-y-2 px-3 py-2.5 @md:grid-cols-[minmax(0,1fr)_auto_auto_auto]"
              >
                <div className="col-start-1 row-start-1 min-w-0">
                  <VariantLabel productName={line.productName} sku={line.sku} options={line.options} size="sm" />
                </div>
                <div className="col-start-2 row-start-1 flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground @md:hidden">المتاح</span>
                  <StockQuantityCell quantity={line.available} tone="muted" />
                </div>
                {onRemoveLine && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="col-start-3 row-start-1 @md:col-start-4"
                    aria-label={`إزالة ${variantPlainLabel(line)}`}
                    disabled={transferMutation.isPending}
                    onClick={() => onRemoveLine(line.variantId)}
                  >
                    <X aria-hidden="true" />
                  </Button>
                )}
                <div className="col-span-3 row-start-2 min-w-0 @md:col-span-1 @md:col-start-3 @md:row-start-1">
                  <input
                    ref={registerInput(String(line.variantId))}
                    data-entry-grid
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={line.available}
                    step={1}
                    dir="ltr"
                    aria-label={`الكمية المنقولة: ${variantPlainLabel(line)}`}
                    aria-invalid={invalid || over}
                    value={quantities[line.variantId] ?? ''}
                    onChange={(event) =>
                      setQuantities((current) => ({
                        ...current,
                        [line.variantId]: event.target.value,
                      }))
                    }
                    onKeyDown={(event) =>
                      onInputKeyDown(event, String(line.variantId), () =>
                        setQuantities((current) => {
                          const next = { ...current };
                          delete next[line.variantId];
                          return next;
                        })
                      )
                    }
                    className={cn(
                      STOCK_NUMBER_FIELD_CLASS,
                      'w-full @md:w-28',
                      (invalid || over) && STOCK_FIELD_ERROR_CLASS
                    )}
                  />
                  {(invalid || over) && (
                    <p className="mt-1 text-xs text-destructive">
                      {invalid ? 'رقم صحيح غير سالب' : 'أكبر من المتاح'}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">ملاحظة</span>
        <input
          type="text"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="سبب النقل (اختياري)"
          className={STOCK_FIELD_CLASS}
        />
      </label>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          {`إجمالي القطع: ${movingTotal} · عدد المتغيرات: ${movingLines.length}`}
        </p>
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={transferMutation.isPending}>
            إلغاء
          </Button>
          <Button type="submit" disabled={!canSubmit} loading={transferMutation.isPending}>
            تنفيذ النقل
          </Button>
        </div>
      </div>
    </form>
  );
}
