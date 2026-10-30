'use client';

import { useI18n } from '@/i18n/I18nProvider';
import { pluralAr } from '@/i18n/pluralAr';
import { GROUP_STATES, type SourceGroup } from '@/types/canonicalNames';

export interface LocationRowContentProps {
  group: SourceGroup;
}

export function LocationRowContent({ group }: LocationRowContentProps) {
  const { t } = useI18n();
  const total = group.sourceRows.length;
  const linked = group.sourceRows.filter((row) => row.canonicalNameId !== null).length;
  const carrierCount = new Set(group.sourceRows.map((row) => row.source)).size;

  const stateText =
    group.state === GROUP_STATES.LINKED && group.linkedName
      ? t('canonical.queue.row.linkedTo', { name: group.linkedName.name })
      : group.state === GROUP_STATES.PARTIAL
        ? t('canonical.queue.row.partial', { linked, total })
        : group.state === GROUP_STATES.MIXED
          ? t('canonical.legend.mixed')
          : null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
      {stateText && <span className="text-foreground">{stateText}</span>}
      {carrierCount > 0 && (
        <span>
          {t('canonical.queue.row.carriers', {
            count: carrierCount,
            carriersNoun: pluralAr(t, 'carrier', carrierCount),
          })}
        </span>
      )}
      <span>
        {t('canonical.queue.row.orders', {
          count: group.orderCount,
          ordersNoun: pluralAr(t, 'order', group.orderCount),
        })}
      </span>
    </div>
  );
}
