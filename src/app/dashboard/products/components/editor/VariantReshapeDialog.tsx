'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import BaseModal from '@/components/ui/base-modal';
import type {
  VariantReshapePlan,
  VariantReshapeValueRemoval,
} from '../../types/products';
import {
  type ReshapeSelections,
  isReshapeBlocked,
  reshapeSelectionKey,
} from './editorModel';

interface VariantReshapeDialogProps {
  open: boolean;
  plan: VariantReshapePlan | null;
  selections: ReshapeSelections;
  discardedLabels: string[];
  onSelect: (key: string, optionId: number | null) => void;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

const SECTION_HEADING_CLASS = 'text-sm font-semibold text-gray-900';

const SELECT_CLASS =
  'min-h-10 w-full rounded-lg border border-gray-200 bg-gray-100 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

function ValueRemovalField({
  removal,
  value,
  onSelect,
}: {
  removal: VariantReshapeValueRemoval;
  value: number | null | undefined;
  onSelect: (key: string, optionId: number | null) => void;
}) {
  const key = reshapeSelectionKey(removal);
  const selectId = `reshape-value-${removal.variantId}-${removal.removedOptionId}`;
  return (
    <div className="space-y-2">
      <label htmlFor={selectId} className="block font-medium text-gray-900 break-words">
        {removal.label}
      </label>
      <select
        id={selectId}
        value={value === null || value === undefined ? '' : String(value)}
        onChange={(event) =>
          onSelect(
            key,
            event.target.value === '' ? null : Number(event.target.value),
          )
        }
        className={SELECT_CLASS}
      >
        {removal.targetRequired ? (
          <option value="" disabled>
            اختر قيمة بديلة
          </option>
        ) : (
          <option value="">بدون بديل</option>
        )}
        {removal.candidateOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {removal.targetRequired && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            لهذا المتغير مخزون ({removal.stock} قطعة)، اختر قيمة بديلة لنقل المخزون إليها قبل التأكيد.
          </span>
        </div>
      )}
    </div>
  );
}

export function VariantReshapeDialog({
  open,
  plan,
  selections,
  discardedLabels,
  onSelect,
  onCancel,
  onConfirm,
}: VariantReshapeDialogProps) {
  return (
    <BaseModal
      isOpen={open}
      onClose={onCancel}
      title="تأكيد تعديل المتغيرات"
      onConfirm={onConfirm}
      confirmText="تأكيد الدمج والحفظ"
      confirmDisabled={plan !== null && isReshapeBlocked(plan, selections)}
      confirmButtonClassName="h-10 min-w-[146px] px-4 sm:h-[37px] bg-primary border-[1.5px] border-primary rounded-[28px] flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-[#4B1BC4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      maxWidth="md:max-w-xl"
    >
      {plan && (
        <div className="space-y-5 text-sm text-gray-700">
          <p>تعديل الخصائص سيغيّر المتغيرات التالية، راجعها قبل التأكيد.</p>

          {discardedLabels.length > 0 && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span className="break-words">
                ستُلغى التعديلات غير المحفوظة على: {discardedLabels.join('، ')}
              </span>
            </div>
          )}

          {plan.merges.length > 0 && (
            <section className="space-y-2">
              <h3 className={SECTION_HEADING_CLASS}>متغيرات سيتم دمجها</h3>
              <ul className="list-disc space-y-1 ps-5">
                {plan.merges.map((merge) => (
                  <li key={merge.survivorVariantId} className="break-words">
                    {merge.sourceLabels.join(' + ')} ← {merge.resultLabel}
                    <span className="text-gray-500">
                      {' '}
                      ({merge.stock} قطعة، {merge.orderLineCount} سطر طلب، {merge.invoiceLineCount} سطر فاتورة، {merge.storeLinkCount} ربط متجر)
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {plan.relinks.length > 0 && (
            <section className="space-y-2">
              <h3 className={SECTION_HEADING_CLASS}>متغيرات سيتم إعادة ربطها</h3>
              <ul className="list-disc space-y-1 ps-5">
                {plan.relinks.map((relink) => (
                  <li key={relink.variantId} className="break-words">
                    {relink.fromLabel} ← {relink.toLabel}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {plan.valueRemovals.length > 0 && (
            <section className="space-y-3">
              <h3 className={SECTION_HEADING_CLASS}>قيم محذوفة من الخصائص</h3>
              {plan.valueRemovals.map((removal) => {
                const key = reshapeSelectionKey(removal);
                return (
                  <ValueRemovalField
                    key={key}
                    removal={removal}
                    value={selections[key]}
                    onSelect={onSelect}
                  />
                );
              })}
            </section>
          )}

          {plan.retired.length > 0 && (
            <section className="space-y-2">
              <h3 className={SECTION_HEADING_CLASS}>متغيرات سيتم إيقافها</h3>
              <ul className="list-disc space-y-1 ps-5">
                {plan.retired.map((item) => (
                  <li key={item.variantId} className="break-words">
                    سيتم إيقاف المتغير {item.label}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </BaseModal>
  );
}
