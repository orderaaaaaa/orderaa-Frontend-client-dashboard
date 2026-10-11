'use client';

import { ColumnChart } from '@/components/ui/charts/ColumnChart';
import type { ConfirmationAttemptsData } from '../types';
import { ErrorState } from '@/components/ui/state-panels';
import type { QuerySectionState } from '../hooks';

interface ConfirmationAttemptsSectionProps {
  data: ConfirmationAttemptsData;
  isLoading: boolean;
  error?: QuerySectionState;
}

export function ConfirmationAttemptsSection({
  data,
  isLoading,
  error,
}: ConfirmationAttemptsSectionProps) {
  if (isLoading) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-primary">عدد محاولات التأكيد</h2>
        <div className="bg-white rounded-lg p-6 border border-gray-100 animate-pulse">
          <div className="h-[350px] bg-gray-100 rounded" />
        </div>
      </section>
    );
  }

  if (error?.isError) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-primary">عدد محاولات التأكيد</h2>
        <ErrorState
          error={error.error}
          fallback="تعذّر تحميل محاولات التأكيد"
          onRetry={error.refetch}
        />
      </section>
    );
  }

  if (data.categories.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-primary">عدد محاولات التأكيد</h2>
        <p className="py-12 text-center text-gray-500">لا توجد بيانات</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-primary">عدد محاولات التأكيد</h2>
      <div className="bg-white rounded-lg p-6 border border-gray-100">
        <ColumnChart
          categories={data.categories}
          series={[{ name: 'عدد الطلبات', data: data.values }]}
        />
      </div>
    </section>
  );
}
