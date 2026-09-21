export const describeElapsed = (minutes: number) => {
  const days = Math.floor(minutes / 1440);
  if (days >= 1) return `${days} يوم`;
  const hours = Math.floor(minutes / 60);
  if (hours >= 1) return `${hours} ساعة`;

  return `${minutes} دقيقة`;
};

export const describeElapsedSince = (isoDate: string) => {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000),
  );
  return describeElapsed(minutes);
};
