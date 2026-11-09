'use client';

import { useI18n } from '@/i18n/I18nProvider';
import type { Locale } from '@/i18n/locale';
import { cn } from '@/lib/utils';
import { formatDate, formatTime, formatWeekdayDate, formatWeekdayDateTime } from '@/utils/format';
import { getTimeAgo, getTimeAgoCompact } from '@/utils/timeAgo';

type DateValue = string | Date | null | undefined;

interface DateTextProps {
  value: DateValue;
  withTime?: boolean;
  dayOnly?: boolean;
  className?: string;
}

interface DateWithRelativeProps extends DateTextProps {
  variant?: 'stacked' | 'inline';
}

const EMPTY_VALUE = '—';
const DATE_TIME_SEPARATOR = '، ';

const toValidDate = (value: DateValue): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const showsTime = (withTime: boolean, dayOnly: boolean): boolean => withTime && !dayOnly;

const timeAttributesOf = (value: DateValue, date: Date, withTime: boolean, dayOnly: boolean) => ({
  dateTime: dayOnly && typeof value === 'string' ? value : date.toISOString(),
  title: showsTime(withTime, dayOnly) ? formatWeekdayDateTime(date) : formatWeekdayDate(date),
});

const relativeTextOf = (value: DateValue, dayOnly: boolean, locale: Locale): string => {
  if (!dayOnly) return getTimeAgo(value, locale);
  return typeof value === 'string' ? getTimeAgoCompact(value) : '';
};

function AbsoluteRuns({ date, withTime }: { date: Date; withTime: boolean }) {
  return (
    <span className="whitespace-nowrap tabular-nums">
      <bdi>{formatDate(date)}</bdi>
      {withTime && (
        <>
          {DATE_TIME_SEPARATOR}
          <bdi>{formatTime(date)}</bdi>
        </>
      )}
    </span>
  );
}

export function DateText({ value, withTime = true, dayOnly = false, className }: DateTextProps) {
  const date = toValidDate(value);
  if (!date) return <span className={className}>{EMPTY_VALUE}</span>;
  return (
    <time {...timeAttributesOf(value, date, withTime, dayOnly)} className={className}>
      <AbsoluteRuns date={date} withTime={showsTime(withTime, dayOnly)} />
    </time>
  );
}

export function RelativeTime({ value, prefix, className }: { value: DateValue; prefix?: string; className?: string }) {
  const { locale } = useI18n();
  const date = toValidDate(value);
  const relative = getTimeAgo(value, locale);
  if (!date || !relative) return null;
  return (
    <span className={className}>
      {prefix}
      <time dateTime={date.toISOString()} title={formatWeekdayDateTime(date)}>
        {relative}
      </time>
    </span>
  );
}

export function DateWithRelative({
  value,
  withTime = true,
  dayOnly = false,
  variant = 'stacked',
  className,
}: DateWithRelativeProps) {
  const { locale } = useI18n();
  const date = toValidDate(value);
  if (!date) return <span className={className}>{EMPTY_VALUE}</span>;

  const relative = relativeTextOf(value, dayOnly, locale);
  const attributes = timeAttributesOf(value, date, withTime, dayOnly);
  const absolute = <AbsoluteRuns date={date} withTime={showsTime(withTime, dayOnly)} />;

  if (variant === 'inline') {
    return (
      <time {...attributes} className={className}>
        {absolute}
        {relative && (
          <>
            {' '}
            <span aria-hidden className="mx-0.5 text-muted-foreground/60">·</span>{' '}
            <span className="whitespace-nowrap text-muted-foreground">{relative}</span>
          </>
        )}
      </time>
    );
  }

  return (
    <time {...attributes} className={cn('inline-flex flex-col items-start gap-0.5 text-start align-top', className)}>
      <span className="leading-tight">{absolute}</span>
      {relative && (
        <span className="whitespace-nowrap text-[11px] font-normal leading-4 text-muted-foreground">{relative}</span>
      )}
    </time>
  );
}
