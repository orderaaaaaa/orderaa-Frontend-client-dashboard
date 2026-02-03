'use client';

import type { FirstAttemptData } from '../types';

interface FirstAttemptSectionProps {
  data: FirstAttemptData;
  isLoading: boolean;
}

export function FirstAttemptSection({
  data,
  isLoading,
}: FirstAttemptSectionProps) {
  if (isLoading) {
    return (
      <section className="bg-white rounded-lg border border-gray-100 p-6">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-40 h-5 bg-gray-200 rounded" />
          <div className="w-24 h-8 bg-gray-200 rounded" />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg border border-gray-100 p-6">
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-lg font-bold text-primary">أول محاولة تتم بعد...</h2>
        <span className="text-2xl font-bold text-gray-800">
          {data.minutes} دقيقة
        </span>
      </div>
    </section>
  );
}
