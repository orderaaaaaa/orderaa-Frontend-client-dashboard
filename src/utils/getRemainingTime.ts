export function getRemainingTime(dateInput?: string | Date | null): string {
  if (!dateInput) return '';

  const target = new Date(dateInput);
  if (isNaN(target.getTime())) return '';

  const now = new Date();
  let diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) return 'انتهى الوقت';

  const totalMinutes = Math.floor(diffMs / (1000 * 60));

  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} ${days === 1 ? 'يوم' : 'أيام'}`);
  }

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`);
  }

  return `متبقي ${parts.join(' و ')}`;
}
