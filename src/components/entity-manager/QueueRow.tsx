'use client';

import { forwardRef, type KeyboardEvent, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, CircleDashed, CircleDot, Clock, Wand2, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useI18n } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/translate';
import { cn } from '@/lib/utils';
import { VisualizedSpelling } from './VisualizedSpelling';
import type { QueueItem, QueueItemState } from './types';

interface StateView {
  labelKey: TranslationKey;
  icon: LucideIcon;
  badgeClassName: string;
  iconClassName: string;
}

const STATE_VIEW: Record<QueueItemState, StateView> = {
  unlinked: {
    labelKey: 'canonical.state.unlinked',
    icon: CircleDashed,
    badgeClassName: 'bg-warning/15',
    iconClassName: 'text-warning',
  },
  partial: {
    labelKey: 'canonical.state.partial',
    icon: CircleDot,
    badgeClassName: 'bg-warning/15',
    iconClassName: 'text-warning',
  },
  mixed: {
    labelKey: 'canonical.state.mixed',
    icon: AlertTriangle,
    badgeClassName: 'bg-destructive/15',
    iconClassName: 'text-destructive',
  },
  linked: {
    labelKey: 'canonical.state.linked',
    icon: CheckCircle2,
    badgeClassName: 'bg-success/15',
    iconClassName: 'text-success',
  },
  implicit: {
    labelKey: 'canonical.state.implicit',
    icon: Wand2,
    badgeClassName: 'bg-primary/10',
    iconClassName: 'text-primary-text',
  },
  stale: {
    labelKey: 'canonical.state.stale',
    icon: Clock,
    badgeClassName: 'bg-warning/15',
    iconClassName: 'text-warning',
  },
};

export interface QueueRowSelectEvent {
  shift: boolean;
}

export function QueueStateBadge({ state }: { state: QueueItemState }) {
  const { t } = useI18n();
  const view = STATE_VIEW[state];
  const StateIcon = view.icon;
  return (
    <Badge variant="outline" className={cn('gap-1 border-transparent text-foreground', view.badgeClassName)}>
      <StateIcon aria-hidden="true" className={cn('size-3.5', view.iconClassName)} />
      {t(view.labelKey)}
    </Badge>
  );
}

export function QueueSelectCheckbox({
  selected,
  label,
  onToggleSelect,
}: {
  selected: boolean;
  label: string;
  onToggleSelect: (event: QueueRowSelectEvent) => void;
}) {
  return (
    <label
      className="flex size-11 shrink-0 cursor-pointer items-center justify-center"
      onClick={(event) => {
        event.preventDefault();
        onToggleSelect({ shift: event.shiftKey });
      }}
    >
      <Checkbox checked={selected} aria-label={label} />
    </label>
  );
}

export interface QueueRowProps {
  row: QueueItem;
  selected: boolean;
  focused?: boolean;
  canManage: boolean;
  checkboxLabel: string;
  onToggleSelect: (event: QueueRowSelectEvent) => void;
  pending?: boolean;
  tabIndex?: number;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  counts?: ReactNode;
  chips?: ReactNode;
  linkControl?: ReactNode;
  overflow?: ReactNode;
  error?: ReactNode;
}

export const QueueRow = forwardRef<HTMLDivElement, QueueRowProps>(function QueueRow(
  {
    row,
    selected,
    focused = false,
    canManage,
    checkboxLabel,
    onToggleSelect,
    pending = false,
    tabIndex,
    onKeyDown,
    counts,
    chips,
    linkControl,
    overflow,
    error,
  },
  ref,
) {
  const { t } = useI18n();

  return (
    <div
      ref={ref}
      role="listitem"
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      data-queue-row={row.id}
      data-state={row.state}
      data-selected={selected ? 'true' : undefined}
      aria-busy={pending || undefined}
      className={cn(
        'flex items-start gap-2 rounded-md border-b py-3 outline-none last:border-b-0',
        'focus-visible:ring-2 focus-visible:ring-ring',
        selected && 'bg-primary/5',
        focused && 'ring-2 ring-ring',
        pending && 'opacity-60',
      )}
    >
      {canManage && (
        <QueueSelectCheckbox selected={selected} label={checkboxLabel} onToggleSelect={onToggleSelect} />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="min-w-0 text-base font-medium text-foreground">
          <VisualizedSpelling text={row.spelling} wrap />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <QueueStateBadge state={row.state} />
          {counts && <span className="text-sm text-muted-foreground">{counts}</span>}
        </div>
        {chips && <div className="flex flex-wrap gap-2">{chips}</div>}
        {error && <div className="text-sm text-destructive">{error}</div>}
      </div>
      {(linkControl || overflow) && (
        <div className="flex shrink-0 items-center gap-1">
          {linkControl}
          {overflow}
        </div>
      )}
    </div>
  );
});
