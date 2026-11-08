'use client';

import { useI18n } from '@/i18n/I18nProvider';
import type { Locale } from '@/i18n/locale';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime } from '@/utils/format';
import { getTimeAgo, getTimeAgoCompact } from '@/utils/timeAgo';

type DateValue = string | Date | null | undefined;

interface DateTextProps {
  value: DateValue;
  withTime?: boolean;
  dayOnly?: boolean;
}

interface DateWithRelativeProps extends DateTextProps {
  variant?: 'stacked' | 'inline';
  className?: string;
}

const RELATIVE_CLASS = 'text-xs text-muted-foreground whitespace-nowrap';

const relativeTextOf = (value: DateValue, dayOnly: boolean, locale: Locale): string => {
  if (!dayOnly) return getTimeAgo(value, locale);
  return typeof value === 'string' ? getTimeAgoCompact(value) : '';
};

export function DateText({ value, withTime = true, dayOnly = false }: DateTextProps) {
  const absolute = dayOnly || !withTime ? formatDate(value) : formatDateTime(value);
  return (
    <span dir="ltr" className="tabular-nums whitespace-nowrap">
      {absolute}
    </span>
  );
}

export function RelativeTime({ value, prefix, className }: { value: DateValue; prefix?: string; className?: string }) {
  const { locale } = useI18n();
  const relative = getTimeAgo(value, locale);
  if (!relative) return null;
  return <span className={className}>{prefix}{relative}</span>;
}

export function DateWithRelative({
  value,
  withTime = true,
  dayOnly = false,
  variant = 'stacked',
  className,
}: DateWithRelativeProps) {
  const { locale } = useI18n();
  const relative = relativeTextOf(value, dayOnly, locale);

  if (variant === 'inline') {
    return (
      <span className={className}>
        <DateText value={value} withTime={withTime} dayOnly={dayOnly} />
        {relative && <> · {relative}</>}
      </span>
    );
  }

  return (
    <span className={cn('flex flex-col', className)}>
      <DateText value={value} withTime={withTime} dayOnly={dayOnly} />
      {relative && <span className={RELATIVE_CLASS}>{relative}</span>}
    </span>
  );
}
