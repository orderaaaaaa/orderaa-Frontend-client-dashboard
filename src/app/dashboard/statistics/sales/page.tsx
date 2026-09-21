'use client';

import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/generated/permission-codes';
import { SalesStatisticsContent } from './components/SalesStatisticsContent';
import { StatisticsState } from './components/StatisticsState';
import { SALES_COPY, resolveSalesViewState } from './constants';

export default function SalesStatisticsPage() {
  const { hasPermission } = usePermissionCheck();
  const canRead = hasPermission(PERMISSION_CODES.REPORTS_SALES_READ);
  const viewState = resolveSalesViewState({
    hasPermission: canRead,
    isLoading: false,
    isFetching: false,
    data: null,
    error: null,
  });

  if (viewState === 'no-access') {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <StatisticsState title={SALES_COPY.noAccessTitle} />
      </div>
    );
  }

  return <SalesStatisticsContent />;
}
