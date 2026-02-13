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
    employeeDetailMap,
    callDurations,
    orderStatusDistribution,
    confirmationAttempts,
    postponedOrdersContent,
    isLoading,
  } = useDashboardData();

  return (
    <div className="w-full space-y-8">
      <TodaySummarySection
        summary={summary}
        firstAttempt={firstAttempt}
        isLoading={isLoading}
      />
      <EmployeeStatusSection employees={employees} employeeDetailMap={employeeDetailMap} isLoading={isLoading} />
      <CallDurationSection items={callDurations} isLoading={isLoading} />
      <OrderStatusDistributionSection
        items={orderStatusDistribution}
        isLoading={isLoading}
      />
      <ConfirmationAttemptsSection
        data={confirmationAttempts}
        isLoading={isLoading}
      />
      <PostponedOrdersContentSection
        data={postponedOrdersContent}
        isLoading={isLoading}
      />
    </div>
  );
}
