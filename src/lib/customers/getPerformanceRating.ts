export function getPerformanceRating(score: number) {
  let rating, color;

  switch (true) {
    case score >= 85:
      rating = 'ممتاز';
      color = '#5D24E1';
      break;
    case score >= 70:
      rating = 'جيد';
      color = '#A078FC';
      break;
    case score <= 50:
      rating = 'ضعيف';
      color = '#CBB5FD';
      break;
    default:
      rating = '';
      color = '';
  }

  return { rating, color };
}
