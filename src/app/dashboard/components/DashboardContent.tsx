'use client';

import { useDashboardData } from '../hooks';
import { TodaySummarySection } from './TodaySummarySection';
import { EmployeeStatusSection } from './EmployeeStatusSection';
import { CallDurationSection } from './CallDurationSection';
import { OrderStatusDistributionSection } from './OrderStatusDistributionSection';
import { ConfirmationAttemptsSection } from './ConfirmationAttemptsSection';
import { FirstAttemptSection } from './FirstAttemptSection';
import { PostponedOrdersContentSection } from './PostponedOrdersContentSection';

export function DashboardContent() {
  const {
    summary,
    employees,
    callDurations,
    orderStatusDistribution,
    confirmationAttempts,
    firstAttempt,
    postponedOrdersContent,
    isLoading,
  } = useDashboardData();

  return (
    <div className="w-full space-y-8">
      <TodaySummarySection summary={summary} isLoading={isLoading} />
      <EmployeeStatusSection employees={employees} isLoading={isLoading} />
      <CallDurationSection items={callDurations} isLoading={isLoading} />
      <OrderStatusDistributionSection
        items={orderStatusDistribution}
        isLoading={isLoading}
      />
      <ConfirmationAttemptsSection
        data={confirmationAttempts}
        isLoading={isLoading}
      />
      <FirstAttemptSection data={firstAttempt} isLoading={isLoading} />
      <PostponedOrdersContentSection
        data={postponedOrdersContent}
        isLoading={isLoading}
      />
    </div>
  );
}
