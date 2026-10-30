'use client';

import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';
import type { SourceGroup, SourceRow } from '@/types/canonicalNames';
import { locationSourceLabel } from '@/app/dashboard/canonical-names/utils/locationSourceLabel';
import type { SourcePicks } from '@/app/dashboard/canonical-names/utils/locationPicks';

export interface LocationChipsProps {
  group: SourceGroup;
  picks: SourcePicks;
  canManage: boolean;
  onTogglePick: (row: SourceRow, checked: boolean) => void;
  onUnlinkRow?: (row: SourceRow) => void;
}

export function LocationChips({ group, picks, canManage, onTogglePick, onUnlinkRow }: LocationChipsProps) {
  const { t } = useI18n();

  if (group.sourceRows.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <ul role="list" className="flex flex-col gap-1">
        {group.sourceRows.map((row) => {
          const label = `${locationSourceLabel(row.source)} · ${row.label}`;
          const checked = picks[row.source] === row.id;
          return (
            <li
              key={row.id}
              className={cn(
                'flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 ps-1 pe-2 text-sm',
                checked && 'border-primary bg-primary/5',
              )}
            >
              <label className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center">
                <Checkbox
                  checked={checked}
                  disabled={!canManage}
                  onCheckedChange={(next) => onTogglePick(row, next === true)}
                  aria-label={label}
                />
              </label>
              <span className="min-w-0 break-words text-foreground">{label}</span>
              {row.stale && (
                <Badge variant="outline" className="gap-1 border-transparent bg-warning/15 text-foreground">
                  <Clock aria-hidden="true" className="size-3.5 text-warning" />
                  {t('canonical.state.stale')}
                </Badge>
              )}
              {canManage && onUnlinkRow && row.canonicalNameId !== null && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-11"
                  onClick={() => onUnlinkRow(row)}
                >
                  {t('canonical.action.unlink')}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground">{t('canonical.legend.onePerSource')}</p>
    </div>
  );
}
