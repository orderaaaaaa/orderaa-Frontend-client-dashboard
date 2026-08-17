'use client';

import { LiaExclamationTriangleSolid, LiaBoxSolid } from 'react-icons/lia';
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
  if (!line) return null;

  // No rule matched, so no stock will move for this line. The number is the
  // cross-warehouse total, shown as information with no judgement attached —
  // flagging it would warn about a movement that is not going to happen.
  if (!line.movesStock) {
    return (
      <p className="flex items-center gap-1 text-sm text-gray-500">
        <LiaBoxSolid className="size-4 shrink-0" />
        <span>المتاح: {line.available}</span>
      </p>
    );
  }

  if (line.safe) {
    return (
      <p className="flex items-center gap-1 text-sm text-gray-600">
        <LiaBoxSolid className="size-4 shrink-0" />
        <span>
          المتاح: {line.available}
          {line.required > 1 && ` (المطلوب: ${line.required})`}
        </span>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <p className="flex items-center gap-1 text-sm font-semibold text-red-600">
        <LiaExclamationTriangleSolid className="size-4 shrink-0" />
        <span>
          غير متوفر بالمخزون — المتاح {line.available} والمطلوب {line.required}
        </span>
      </p>
      {line.blocked && (
        // The settings refuse confirmation for this product, so the agent must
        // be told to pick something else rather than discovering it on submit.
        <p className="pr-5 text-xs text-red-500">
          لا يمكن تأكيد الطلب بهذا المنتج — اختر منتجًا آخر
        </p>
      )}
    </div>
  );
}
