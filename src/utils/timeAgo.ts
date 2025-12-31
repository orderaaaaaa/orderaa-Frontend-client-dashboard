function parseDate(dateInput: string | Date): Date {
  if (typeof dateInput === 'string') {
    // Strip timezone indicator (Z or +/-offset) to treat the date as-is from API
    const dateWithoutTz = dateInput.replace(/Z$/, '').replace(/[+-]\d{2}:\d{2}$/, '');
    return new Date(dateWithoutTz);
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
