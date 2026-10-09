'use client';

import { useStatusLabel } from '@/hooks/useStatusLabel';
import { cn } from '@/lib/utils';
import { SETTLEMENT_DIRECT_SOURCE_STATUSES } from '@/lib/api/settlement';
import type { SettlementRow } from '@/lib/api/settlement';

interface SettlementAcceptedStatusesNoteProps {
  className?: string;
}

const TARGETS = Object.keys(SETTLEMENT_DIRECT_SOURCE_STATUSES) as SettlementRow['targetStatus'][];

export default function SettlementAcceptedStatusesNote({ className }: SettlementAcceptedStatusesNoteProps) {
  const { getStatusLabel } = useStatusLabel();

  return (
    <div className={cn('space-y-1 text-sm text-muted-foreground', className)}>
      <p>الحالات المقبولة مباشرة:</p>
      {TARGETS.map((target) => (
        <p key={target}>
          {getStatusLabel(target)}: {SETTLEMENT_DIRECT_SOURCE_STATUSES[target].map((status) => getStatusLabel(status)).join('، ')}
        </p>
      ))}
      <p>الطلبات في الحالات الأخرى تظهر في الأخطاء مع السبب، وبعضها يمكن إضافته عبر &quot;إضافة رغم الخطأ&quot;</p>
    </div>
  );
}
