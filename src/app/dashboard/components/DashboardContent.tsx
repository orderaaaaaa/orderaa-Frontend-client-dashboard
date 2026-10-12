'use client';

import { useDashboardData } from '../hooks';
import { TodaySummarySection } from './TodaySummarySection';
import { EmployeeStatusSection } from './EmployeeStatusSection';
import { CallDurationSection } from './CallDurationSection';
import { OrderStatusDistributionSection } from './OrderStatusDistributionSection';
import { ConfirmationAttemptsSection } from './ConfirmationAttemptsSection';
import { PostponedOrdersContentSection } from './PostponedOrdersContentSection';

export function DashboardContent() {
  const {
    summary,
    firstAttempt,
    employees,
    callDurations,
    orderStatusDistribution,
    confirmationAttempts,
    postponedOrdersContent,
    isLoading,
    errors,
  } = useDashboardData();

  return (
    <div className="w-full space-y-8">
      <TodaySummarySection
        summary={summary}
        firstAttempt={firstAttempt}
        isLoading={isLoading}
        error={errors.summary}
      />
      <EmployeeStatusSection
        employees={employees}
        isLoading={isLoading}
        error={errors.employees}
      />
      <CallDurationSection
        items={callDurations}
        isLoading={isLoading}
        error={errors.callDurations}
      />
      <OrderStatusDistributionSection
        items={orderStatusDistribution}
        isLoading={isLoading}
        error={errors.orderStatusDistribution}
      />
      <ConfirmationAttemptsSection
        data={confirmationAttempts}
        isLoading={isLoading}
        error={errors.confirmationAttempts}
      />
      <PostponedOrdersContentSection
        data={postponedOrdersContent}
        isLoading={isLoading}
        error={errors.postponedOrdersContent}
      />
    </div>
  );
}
