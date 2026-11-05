'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
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
  isTransferWarehouseNotAllowed,
} from '@/utils/apiError';

export interface MoveStockLine {
  variantId: number;
  productName: string;
  sku: string | null;
  options: VariantDisplayItem[];
  available: number;
}

interface MoveStockFormProps {
  fromWarehouseId: number;
  lines: MoveStockLine[];
  onDone(): void;
  onCancel(): void;
}

export function MoveStockForm({ fromWarehouseId, lines, onDone, onCancel }: MoveStockFormProps) {
  const [toWarehouseId, setToWarehouseId] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [note, setNote] = useState('');
  const [attempted, setAttempted] = useState(false);
  const canReadWarehouses = useHasPermissionStrict(PERMISSION_CODES.WAREHOUSES_STOCK_READ);
  const destinations = useStockWarehouseOptions({ enabled: canReadWarehouses });
  const queryClient = useQueryClient();
  const transferMutation = useTransferStockMutation();
  const { registerInput, onInputKeyDown } = useEntryGrid(
    lines.map((line) => String(line.variantId))
  );

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
  const hasInvalid = lines.some(invalidOf);
  const hasOverAvailable = lines.some(overAvailableOf);
  const canSubmit =
    toWarehouseId !== null &&
    movingLines.length > 0 &&
    !hasInvalid &&
    !hasOverAvailable &&
    !transferMutation.isPending;

  const submit = async () => {
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
        void invalidateStockViews(queryClient);
      }
      toast.error(getApiErrorMessage(err, 'تعذر نقل المخزون'), { autoClose: 8000 });
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

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2.5 text-start font-medium">
                المنتج / المتغير
              </th>
              <th scope="col" className="px-3 py-2.5 text-start font-medium">
                المتاح
              </th>
              <th scope="col" className="px-3 py-2.5 text-start font-medium">
                الكمية المنقولة
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lines.map((line) => {
              const invalid = invalidOf(line);
              const over = overAvailableOf(line);
              return (
                <tr key={line.variantId}>
                  <td className="px-3 py-2.5">
                    <VariantLabel productName={line.productName} sku={line.sku} options={line.options} size="sm" />
                  </td>
                  <td className="px-3 py-2.5">
                    <StockQuantityCell quantity={line.available} tone="muted" />
                  </td>
                  <td className="px-3 py-2.5 align-top">
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
                        'w-28',
                        (invalid || over) && STOCK_FIELD_ERROR_CLASS
                      )}
                    />
                    {(invalid || over) && (
                      <p className="mt-1 text-xs text-destructive">
                        {invalid ? 'رقم صحيح غير سالب' : 'أكبر من المتاح'}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

      <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={transferMutation.isPending}>
          إلغاء
        </Button>
        <Button type="submit" disabled={!canSubmit} loading={transferMutation.isPending}>
          تنفيذ النقل
        </Button>
      </div>
    </form>
  );
}
