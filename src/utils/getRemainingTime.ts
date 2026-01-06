export function getRemainingTime(dateInput?: string | Date | null): string {
  if (!dateInput) return '';

  const target = new Date(dateInput);
  if (isNaN(target.getTime())) return '';

  const now = new Date();
  let diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) return 'انتهى الوقت';

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days > 0 && hours > 0) {
    return `متبقي ${days} ${days === 1 ? 'يوم' : 'أيام'} و ${hours} ${
      hours === 1 ? 'ساعة' : 'ساعات'
    }`;
  }

  if (days > 0) {
    return `متبقي ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
  }

  return `متبقي ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
}
