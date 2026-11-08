import React from 'react';
import Link from 'next/link';
import { History } from 'lucide-react';
import { DateWithRelative } from '@/components/ui/date-with-relative';
import {
  ORDER_LEDGER_ENTRY_KIND,
  type OrderLedgerEntry,
} from '@/types/orderLedger';
import {
  LEDGER_LIFECYCLE_LABELS,
  lifecycleReasonOf,
} from '@/constants/orderLedgerLabels';

export function OrderLedgerLifecycleRow({
  entry,
}: {
  entry: OrderLedgerEntry;
}) {
  const lifecycle = entry.lifecycle;
  if (!lifecycle) return null;

  const label =
    entry.kind === ORDER_LEDGER_ENTRY_KIND.PART_RESTORE
      ? LEDGER_LIFECYCLE_LABELS.PART_RESTORE(lifecycle.part)
      : entry.kind === ORDER_LEDGER_ENTRY_KIND.ORDER_DELETION
        ? LEDGER_LIFECYCLE_LABELS.ORDER_DELETION(null)
        : LEDGER_LIFECYCLE_LABELS.ORDER_RESTORE(null);

  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 shrink-0 rounded-full bg-card flex items-center justify-center border-[3px] border-primary/40">
        <History className="w-4 h-4 text-primary-text" />
      </div>
      <div className="flex flex-col min-w-0">
        <h3 className="text-base font-semibold text-foreground break-words">
          {label}
        </h3>
        <p className="text-sm text-primary-text break-words">
          {lifecycleReasonOf(lifecycle.origin, lifecycle.linkedOrder)}
        </p>
        {lifecycle.actorName && (
          <p className="text-sm text-foreground break-words">
            {lifecycle.actorName}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          <DateWithRelative value={entry.at} variant="inline" />
        </p>
        {entry.kind === ORDER_LEDGER_ENTRY_KIND.PART_RESTORE &&
          lifecycle.part && (
            <Link
              href={`/dashboard/orders/${lifecycle.part.id}`}
              className="text-sm text-primary-text underline w-fit"
            >
              عرض
            </Link>
          )}
      </div>
    </div>
  );
}

export default OrderLedgerLifecycleRow;
