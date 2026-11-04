import { DEFAULT_LOCALE, type Locale } from '@/i18n/locale';
import { translate, type TranslationKey } from '@/i18n/translate';

const UNIT_KEYS: Record<'day' | 'hour' | 'minute', readonly [TranslationKey, TranslationKey]> = {
  day: ['timeAgo.unit.day.one', 'timeAgo.unit.day.other'],
  hour: ['timeAgo.unit.hour.one', 'timeAgo.unit.hour.other'],
  minute: ['timeAgo.unit.minute.one', 'timeAgo.unit.minute.other'],
};

const amountOf = (locale: Locale, count: number, unit: keyof typeof UNIT_KEYS) =>
  translate(locale, 'timeAgo.amount', {
    count,
    unit: translate(locale, UNIT_KEYS[unit][count === 1 ? 0 : 1]),
  });

function parseDate(dateInput: string | Date): Date {
  if (typeof dateInput === 'string') {
    return new Date(dateInput);
  }
  return dateInput;
}

export function getTimeAgo(
  dateInput?: string | Date | null,
  locale: Locale = DEFAULT_LOCALE
): string {
  if (!dateInput) return '';

  const date = parseDate(dateInput);

  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) return '';

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    const remainingHours = diffHours % 24;

    if (remainingHours > 0) {
      const value = translate(locale, 'timeAgo.pair', {
        first: amountOf(locale, diffDays, 'day'),
        second: amountOf(locale, remainingHours, 'hour'),
      });
      return translate(locale, 'timeAgo.ago', { value });
    }
    return translate(locale, 'timeAgo.ago', { value: amountOf(locale, diffDays, 'day') });
  }

  if (diffHours > 0) {
    return translate(locale, 'timeAgo.ago', { value: amountOf(locale, diffHours, 'hour') });
  }

  if (diffMinutes > 0) {
    return translate(locale, 'timeAgo.ago', { value: amountOf(locale, diffMinutes, 'minute') });
  }

  return translate(locale, 'timeAgo.now');
}

const CAIRO_TIME_ZONE = 'Africa/Cairo';
const DAY_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const cairoDayNumber = (year: number, month: number, day: number): number =>
  Date.UTC(year, month - 1, day) / MS_PER_DAY;

export function cairoDayKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CAIRO_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getTimeAgoCompact(
  dayKey: string | null | undefined,
  now: Date = new Date(),
): string {
  const match = dayKey ? DAY_KEY_PATTERN.exec(dayKey) : null;
  if (!match) return '';

  const cairoToday = cairoDayKey(now);
  const todayMatch = DAY_KEY_PATTERN.exec(cairoToday);
  if (!todayMatch) return '';

  const diff =
    cairoDayNumber(Number(match[1]), Number(match[2]), Number(match[3])) -
    cairoDayNumber(Number(todayMatch[1]), Number(todayMatch[2]), Number(todayMatch[3]));
  if (diff === 0) return 'اليوم';

  const ahead = diff > 0;
  const days = Math.abs(diff);
  if (days === 1) return ahead ? 'غداً' : 'أمس';
  if (days === 2) return ahead ? 'بعد يومين' : 'منذ يومين';
  if (days <= 10) return ahead ? `بعد ${days} أيام` : `منذ ${days} أيام`;
  return ahead ? `بعد ${days} يوماً` : `منذ ${days} يوماً`;
}

export function getTimeAgoShort(dateInput?: string | Date | null): string {
  if (!dateInput) return '';

  const date = parseDate(dateInput);

  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) return '';

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    const remainingHours = diffHours % 24;
    return `منذ ${diffDays} يوم، ${remainingHours} ساعات`;
  }

  if (diffHours > 0) {
    return `منذ ${diffHours} ساعات`;
  }

  if (diffMinutes > 0) {
    return `منذ ${diffMinutes} دقيقة`;
  }

  return 'الآن';
}
