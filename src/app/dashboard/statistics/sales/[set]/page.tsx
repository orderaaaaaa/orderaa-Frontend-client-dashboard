'use client';

import { notFound } from 'next/navigation';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/generated/permission-codes';
import { SalesSubPageContent } from '../components/SalesSubPageContent';
import { StatisticsState } from '../components/StatisticsState';
import { SALES_COPY, isSalesSubPageSet } from '../constants';
import { parseSalesSearchParams } from '../hooks/useSalesStatisticsFilters';

interface SalesSubPageProps {
  params: { set: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export default function SalesSubPage({ params, searchParams }: SalesSubPageProps) {
  const { hasPermission } = usePermissionCheck();
  const canRead = hasPermission(PERMISSION_CODES.REPORTS_SALES_READ);

  const set = params.set;
  if (!isSalesSubPageSet(set)) notFound();

  if (!canRead) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <StatisticsState title={SALES_COPY.noAccessTitle} />
      </div>
    );
  }

  return (
    <SalesSubPageContent set={set} initialFilters={parseSalesSearchParams(searchParams)} />
  );
}
