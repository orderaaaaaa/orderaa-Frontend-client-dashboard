'use client';

import type { MouseEvent } from 'react';
import { MessageSquareText, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';
import { formatNumber } from './formatNumber';

export function UnreadNotesCountPill({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <Badge
      variant="destructive"
      aria-hidden="true"
      className={cn(
        'min-w-5 rounded-full px-1.5 text-[11px] leading-4 dark:border-transparent dark:bg-danger-fill dark:text-white',
        className,
      )}
    >
      <span dir="ltr">{count > 9 ? '9+' : formatNumber(count)}</span>
    </Badge>
  );
}

export function UnreadCountButton({
  count,
  icon: Icon,
  label,
  onOpen,
}: {
  count: number | undefined;
  icon: LucideIcon;
  label: string;
  onOpen: (opener: HTMLElement) => void;
}) {
  if (!count || count <= 0) return null;
  return (
    <Button
      type="button"
      variant="ghost"
      className="h-auto gap-1 p-0"
      title={label}
      aria-label={label}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onOpen(event.currentTarget);
      }}
    >
      <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
      <UnreadNotesCountPill count={count} />
    </Button>
  );
}

export function FollowupNotesUnreadBadge({
  count,
  onOpen,
}: {
  count: number | undefined;
  onOpen: (opener: HTMLElement) => void;
}) {
  const { t } = useI18n();
  return (
    <UnreadCountButton
      count={count}
      icon={MessageSquareText}
      label={t('inProcess.table.unreadCarrierMessages', { n: formatNumber(count ?? 0) })}
      onOpen={onOpen}
    />
  );
}
