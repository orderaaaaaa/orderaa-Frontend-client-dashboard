'use client';

import { LiaExclamationTriangleSolid } from 'react-icons/lia';
import type { VariantAvailability } from '@/lib/api/warehouses';

interface Props {
  variants: VariantAvailability[];
  /** the variant the current attribute selection resolves to, if any */
  selected: VariantAvailability | null;
}

/**
 * T27 — availability beside each size and colour, so an agent on the phone can
 * offer something that actually exists.
 *
 * The backend labels a variant by its option names; the picker holds an
 * attribute→option map. Matching on the SORTED SET of option names rather than
 * a joined string keeps the two independent of attribute ordering, which the
 * picker does not control.
 */
export const matchVariant = (
  variants: VariantAvailability[],
  selection: Record<string, string>
): VariantAvailability | null => {
  const chosen = Object.values(selection).filter(Boolean);
  if (chosen.length === 0) return null;

  const key = [...chosen].sort().join('|');
  return (
    variants.find(
      (variant) =>
        variant.variantLabel
          .split(' / ')
          .map((part) => part.trim())
          .sort()
          .join('|') === key
    ) ?? null
  );
};

export function VariantAvailabilityList({ variants, selected }: Props) {
  if (variants.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#ECECEC] bg-white p-3" dir="rtl">
      <p className="mb-2 text-sm font-bold text-[#1F1F1F]">
        المتاح بالمخزون
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selected?.variantId === variant.variantId;
          const unavailable = variant.available <= 0;

          return (
            <span
              key={variant.variantId}
              className={[
                'flex items-center gap-1 rounded-full border px-3 py-1 text-xs',
                isSelected ? 'ring-2 ring-primary' : '',
                unavailable
                  ? // Not selectable means the product's settings refuse it, so
                    // it reads as disabled rather than merely low.
                    variant.selectable
                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                    : 'border-gray-200 bg-gray-100 text-gray-400 line-through'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800',
              ].join(' ')}
            >
              {unavailable && (
                <LiaExclamationTriangleSolid className="size-3.5 shrink-0" />
              )}
              <span>
                {variant.variantLabel}: {variant.available}
              </span>
            </span>
          );
        })}
      </div>

      {selected && !selected.selectable && (
        <p className="mt-2 text-xs font-semibold text-red-600">
          هذا الاختيار غير متوفر بالمخزون وإعدادات المنتج تمنع إضافته — اختر
          حاجة تانية
        </p>
      )}
    </div>
  );
}
