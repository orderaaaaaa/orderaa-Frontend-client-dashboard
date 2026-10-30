'use client';

import { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { EmptyState } from '@/components/ui/state-panels';
import type {
  StocktakeLineDto,
  StocktakeRefusedLine,
} from '@/app/dashboard/inventory/stock-management/types/stocktake';
import { formatStockNumber } from '@/utils/format';
import { StockQuantityCell } from './StockQuantityCell';
import { VariantLabel } from './VariantLabel';
import { VarianceChip } from './VarianceChip';

interface StocktakeReviewDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  lines: StocktakeLineDto[];
  netDelta: number | null;
  onConfirm(note: string): void;
  isPending: boolean;
  refused?: StocktakeRefusedLine[];
}

const HEADER_CELL_CLASS = 'px-3 py-2.5 text-start text-xs font-semibold text-muted-foreground';
const BODY_CELL_CLASS = 'px-3 py-2.5 align-middle';

const deltaOfLine = (line: StocktakeLineDto): number | null =>
  line.countedQuantity === null ? null : line.countedQuantity - line.currentQuantity;

export function StocktakeReviewDialog({
  open,
  onOpenChange,
  lines,
  netDelta,
  onConfirm,
  isPending,
  refused = [],
}: StocktakeReviewDialogProps) {
  const [note, setNote] = useState('');
  const refusedIds = refused.map((line) => line.variantId);

  return (
    <BaseModal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="مراجعة الجرد قبل الترحيل"
      onConfirm={() => onConfirm(note.trim())}
      confirmText="ترحيل الجرد"
      isLoading={isPending}
      maxWidth="md:max-w-[760px]"
    >
      <div className="space-y-5">
        {refused.length > 0 && (
          <div
            role="alert"
            className="space-y-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4"
          >
            <p className="text-sm font-semibold text-destructive">
              تعذر الترحيل: الرصيد الحالي لا يكفي للأسطر التالية، ولم يتم ترحيل أي سطر. عدّل
              هذه الأسطر ثم أعد المراجعة.
            </p>
            <ul className="space-y-2 text-sm">
              {refused.map((line) => (
                <li key={line.variantId} className="flex flex-col gap-0.5">
                  <VariantLabel
                    productName={line.productName}
                    sku={line.sku}
                    options={[]}
                    optionsLabel={line.variantLabel}
                    size="sm"
                  />
                  <span className="text-muted-foreground">
                    الكمية بالنظام{' '}
                    <span dir="ltr" className="font-semibold tabular-nums text-foreground">
                      {formatStockNumber(line.live)}
                    </span>
                    {' · '}المعدود{' '}
                    <span dir="ltr" className="font-semibold tabular-nums text-foreground">
                      {formatStockNumber(line.counted)}
                    </span>
                    {' · '}المطلوب خصمه{' '}
                    <span dir="ltr" className="font-semibold tabular-nums text-foreground">
                      {formatStockNumber(line.required)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <dt className="text-xs text-muted-foreground">عدد الأسطر المتغيرة</dt>
            <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">
              <span dir="ltr">{lines.length}</span>
            </dd>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <dt className="text-xs text-muted-foreground">صافي الفرق</dt>
            <dd className="mt-1">
              <VarianceChip delta={netDelta} />
            </dd>
          </div>
        </dl>

        {lines.length === 0 ? (
          <EmptyState
            title="لا توجد فروقات"
            description="الترحيل سيغلق الجلسة دون أي حركة مخزون"
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[36rem] text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b border-border">
                  <th scope="col" className={HEADER_CELL_CLASS}>
                    المنتج / المتغير
                  </th>
                  <th scope="col" className={HEADER_CELL_CLASS}>
                    المتوقع عند البدء
                  </th>
                  <th scope="col" className={HEADER_CELL_CLASS}>
                    الكمية الحالية
                  </th>
                  <th scope="col" className={HEADER_CELL_CLASS}>
                    المعدود
                  </th>
                  <th scope="col" className={HEADER_CELL_CLASS}>
                    الفرق
                  </th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr
                    key={line.variantId}
                    className={
                      refusedIds.includes(line.variantId)
                        ? 'border-b border-border bg-destructive/5 last:border-b-0'
                        : 'border-b border-border last:border-b-0'
                    }
                  >
                    <td className={BODY_CELL_CLASS}>
                      <VariantLabel
                        productName={line.productName}
                        sku={line.sku}
                        options={[]}
                        optionsLabel={line.variantLabel}
                        size="sm"
                      />
                    </td>
                    <td className={BODY_CELL_CLASS}>
                      <StockQuantityCell quantity={line.expectedQuantity} tone="muted" />
                    </td>
                    <td className={BODY_CELL_CLASS}>
                      <StockQuantityCell quantity={line.currentQuantity} tone="muted" />
                    </td>
                    <td className={BODY_CELL_CLASS}>
                      {line.countedQuantity === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <StockQuantityCell quantity={line.countedQuantity} />
                      )}
                    </td>
                    <td className={BODY_CELL_CLASS}>
                      <VarianceChip delta={deltaOfLine(line)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="stocktake-review-note" className="text-sm font-medium text-foreground">
            ملاحظة على الترحيل (اختياري)
          </label>
          <textarea
            id="stocktake-review-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
    </BaseModal>
  );
}
