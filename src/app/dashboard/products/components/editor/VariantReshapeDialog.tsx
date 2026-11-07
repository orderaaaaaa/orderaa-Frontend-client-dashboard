'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import BaseModal from '@/components/ui/base-modal';
import type { VariantReshapePlan } from '../../types/products';

interface VariantReshapeDialogProps {
  open: boolean;
  plan: VariantReshapePlan | null;
  discardedLabels: string[];
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

const SECTION_HEADING_CLASS = 'text-sm font-semibold text-gray-900';

function ReshapeSection({
  heading,
  items,
}: {
  heading: string;
  items: { key: number; text: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-2">
      <h3 className={SECTION_HEADING_CLASS}>{heading}</h3>
      <ul className="list-disc space-y-1 ps-5">
        {items.map((item) => (
          <li key={item.key} className="break-words">
            {item.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function VariantReshapeDialog({
  open,
  plan,
  discardedLabels,
  onCancel,
  onConfirm,
}: VariantReshapeDialogProps) {
  const visibleRelinks = plan
    ? plan.relinks.filter((relink) => !relink.keyOnly)
    : [];
  const keyOnlyCount = plan
    ? plan.relinks.filter((relink) => relink.keyOnly).length
    : 0;
  return (
    <BaseModal
      isOpen={open}
      onClose={onCancel}
      title="تأكيد تعديل المتغيرات"
      onConfirm={onConfirm}
      confirmText="تأكيد الدمج والحفظ"
      confirmButtonClassName="h-10 min-w-[146px] px-4 sm:h-[37px] bg-primary border-[1.5px] border-primary rounded-[28px] flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

          {visibleRelinks.length > 0 && (
            <section className="space-y-2">
              <h3 className={SECTION_HEADING_CLASS}>متغيرات سيتم إعادة ربطها</h3>
              <ul className="list-disc space-y-1 ps-5">
                {visibleRelinks.map((relink) => (
                  <li key={relink.variantId} className="break-words">
                    {relink.fromLabel} ← {relink.toLabel}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {keyOnlyCount > 0 && (
            <p className="text-xs text-gray-500">
              سيتم أيضاً تصحيح مفاتيح داخلية لـ {keyOnlyCount} متغير
            </p>
          )}

          <ReshapeSection
            heading="ستُحذف هذه المتغيرات"
            items={plan.goingSoft.map((row) => ({ key: row.variantId, text: row.label }))}
          />
          <ReshapeSection
            heading="ستُحذف هذه المتغيرات لأنها لا تحمل الخاصية الجديدة"
            items={plan.addedGoingSoft.map((row) => ({ key: row.variantId, text: row.label }))}
          />
          <ReshapeSection
            heading="تبقى هذه المتغيرات بدون بطاقة حتى يُنقل مخزونها"
            items={plan.namedInUse.map((row) => ({
              key: row.variantId,
              text: `${row.label} (${row.stockTotal} قطعة، ${row.openLines} سطر طلب مفتوح)`,
            }))}
          />
          <ReshapeSection
            heading="ستعود هذه المتغيرات"
            items={plan.returning.map((row) => ({ key: row.variantId, text: row.label }))}
          />
          <ReshapeSection
            heading="ستُربط هذه المتغيرات بالقيمة الجديدة"
            items={plan.linkedInPlace.map((row) => ({
              key: row.variantId,
              text: `${row.label} ← ${row.optionName}`,
            }))}
          />
          <ReshapeSection
            heading="لن تتغير هذه المتغيرات لأن تركيبتها مستخدمة"
            items={plan.leftAlone.map((row) => ({ key: row.variantId, text: row.label }))}
          />
          <ReshapeSection
            heading="تبقى هذه المتغيرات محذوفة لأن تركيبتها مستخدمة"
            items={plan.stayingSoft.map((row) => ({ key: row.variantId, text: row.label }))}
          />
        </div>
      )}
    </BaseModal>
  );
}
