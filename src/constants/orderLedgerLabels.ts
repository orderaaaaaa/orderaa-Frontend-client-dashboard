import type { OrderChangeOrigin } from '@/types/orderChangeHistory';
import type { OrderLedgerEntryKind } from '@/types/orderLedger';
import { orderChangeOriginLabelOf } from '@/constants/orderFieldLabels';

export const LEDGER_LIFECYCLE_LABELS: Record<
  Exclude<OrderLedgerEntryKind, 'EVENT' | 'CHANGE'>,
  (part: { code: string } | null) => string
> = {
  ORDER_DELETION: () => 'حذف الطلب',
  ORDER_RESTORE: () => 'استعادة الطلب',
  PART_RESTORE: (part) =>
    part ? `استعادة الجزء #${part.code}` : 'استعادة الجزء',
};

export const LEDGER_LIFECYCLE_REASONS: Partial<
  Record<
    OrderChangeOrigin,
    { withCode: (code: string) => string; withoutCode: string }
  >
> = {
  PARTIAL_DELIVERY_UNDO: {
    withCode: (code) => `تراجع عن التسليم الجزئي للطلب #${code}`,
    withoutCode: 'تراجع عن التسليم الجزئي',
  },
  PARTIAL_DELIVERY: {
    withCode: (code) => `إعادة تقسيم التسليم الجزئي للطلب #${code}`,
    withoutCode: 'إعادة تقسيم التسليم الجزئي',
  },
};

export function lifecycleReasonOf(
  origin: string,
  linkedOrder: { code: string } | null,
): string {
  if (Object.prototype.hasOwnProperty.call(LEDGER_LIFECYCLE_REASONS, origin)) {
    const reason = LEDGER_LIFECYCLE_REASONS[origin as OrderChangeOrigin];
    if (reason)
      return linkedOrder
        ? reason.withCode(linkedOrder.code)
        : reason.withoutCode;
  }
  return orderChangeOriginLabelOf(origin);
}
