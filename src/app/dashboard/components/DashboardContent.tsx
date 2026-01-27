'use client';

import { useDashboardData } from '../hooks';
import { TodaySummarySection } from './TodaySummarySection';
import { EmployeeStatusSection } from './EmployeeStatusSection';
import { CallDurationSection } from './CallDurationSection';

export function DashboardContent() {
  const { summary, employees, callDurations, isLoading } = useDashboardData();

  return (
    <div className="w-full space-y-8">
      <TodaySummarySection summary={summary} isLoading={isLoading} />
      <EmployeeStatusSection employees={employees} isLoading={isLoading} />
      <CallDurationSection items={callDurations} isLoading={isLoading} />
    </div>
  );
}
