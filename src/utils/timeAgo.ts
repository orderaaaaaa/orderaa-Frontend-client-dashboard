function parseDate(dateInput: string | Date): Date {
  if (typeof dateInput === 'string') {
    return new Date(dateInput);
  }
  return dateInput;
}

export function getTimeAgo(dateInput?: string | Date | null): string {
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
    const daysLabel = diffDays === 1 ? 'يوم' : 'ايام';

    if (remainingHours > 0) {
      const hoursLabel = remainingHours === 1 ? 'ساعة' : 'ساعات';
      return `منذ ${diffDays} ${daysLabel} و ${remainingHours} ${hoursLabel}`;
    }
    return `منذ ${diffDays} ${daysLabel}`;
  }

  if (diffHours > 0) {
    const hoursLabel = diffHours === 1 ? 'ساعة' : 'ساعات';
    return `منذ ${diffHours} ${hoursLabel}`;
  }

  if (diffMinutes > 0) {
    const minutesLabel = diffMinutes === 1 ? 'دقيقة' : 'دقائق';
    return `منذ ${diffMinutes} ${minutesLabel}`;
  }

  return 'الآن';
}

const CAIRO_TIME_ZONE = 'Africa/Cairo';
const DAY_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const cairoDayNumber = (year: number, month: number, day: number): number =>
  Date.UTC(year, month - 1, day) / MS_PER_DAY;

export function getTimeAgoCompact(
  dayKey: string | null | undefined,
  now: Date = new Date(),
): string {
  const match = dayKey ? DAY_KEY_PATTERN.exec(dayKey) : null;
  if (!match) return '';

  const cairoToday = new Intl.DateTimeFormat('en-CA', {
    timeZone: CAIRO_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
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
