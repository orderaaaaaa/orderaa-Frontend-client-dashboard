'use client';

import { toStockNumber } from '@/utils/format';
import { LiaExclamationTriangleSolid, LiaBoxSolid } from 'react-icons/lia';
import { useI18n } from '@/i18n/I18nProvider';
import type { AvailabilityLine } from '@/lib/api/warehouses';

interface Props {
  line: AvailabilityLine | undefined;
}

/**
 * T27 — the available count on an order product card, and the warning icon
 * («علامه خطر») when the move would genuinely fail.
 *
 * The count is ALWAYS shown, by decision: an agent on the phone needs the number
 * whether or not it is a problem.
 *
 * The warning is NOT. A shortage the rule itself permits — `allowNegative`, or
 * `onInsufficient: SKIP` — arrives with `safe: true` and shows the number
 * plainly. An icon that appears on moves that always succeed trains agents to
 * ignore it, and then it is worth nothing on the moves that do fail.
 */
export function StockAvailabilityBadge({ line }: Props) {
  // Above the `!line` bail-out: hooks cannot sit behind an early return.
  const { t } = useI18n();

  if (!line) return null;

  if (line.available === null || line.availableWarehouse === null) {
    return (
      <p className="flex items-center gap-1 text-sm font-semibold text-red-600">
        <LiaExclamationTriangleSolid className="size-4 shrink-0" />
        <span>{t('orderDetails.stock.availableWarehouseNotSet')}</span>
      </p>
    );
  }

  if (line.safe) {
    return (
      <p className="flex items-center gap-1 text-sm text-gray-600">
        <LiaBoxSolid className="size-4 shrink-0" />
        {/* Two complete templates rather than one plus an appended tail: the
            parenthetical carries a leading space and a fixed position, both of
            which are the template's business, not this component's. */}
        <span>
          {line.required > 1
            ? t('orderDetails.stock.availableWithRequired', {
                available: toStockNumber(line.available),
                required: toStockNumber(line.required),
              })
            : t('orderDetails.stock.available', { count: toStockNumber(line.available) })}
        </span>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <p className="flex items-center gap-1 text-sm font-semibold text-red-600">
        <LiaExclamationTriangleSolid className="size-4 shrink-0" />
        <span>
          {t('orderDetails.stock.unavailable', {
            available: toStockNumber(line.available),
            required: toStockNumber(line.required),
          })}
        </span>
      </p>
      {line.blocked && (
        // The settings refuse confirmation for this product, so the agent must
        // be told to pick something else rather than discovering it on submit.
        // `ps-5` keeps the indent under the icon on both sides.
        <p className="ps-5 text-xs text-red-500">
          {t('orderDetails.stock.blocked')}
        </p>
      )}
    </div>
  );
}
