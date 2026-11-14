'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { StockPageHeader } from '@/components/stock/StockPageHeader';
import { KpiCardSkeleton } from '@/components/ui/kpi-card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/state-panels';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useStocktakeQuery } from '@/services/stocktake';
import {
  defaultStocktakeStep,
  parseStocktakeStep,
  type StocktakeStep,
} from '../../utils/stocktakeSteps';
import { StocktakeAccessDenied } from './StocktakeAccessDenied';
import { StocktakeCountView } from './StocktakeCountView';
import { StocktakeItemsStep } from './StocktakeItemsStep';
import { stocktakeSessionBreadcrumbs } from './stocktakeRoutes';

interface StocktakeSessionContentProps {
  stocktakeId: number;
}

function StocktakeSessionSkeleton({ stocktakeId }: StocktakeSessionContentProps) {
  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      <StockPageHeader
        title={`جلسة جرد #${stocktakeId}`}
        breadcrumbs={stocktakeSessionBreadcrumbs(stocktakeId)}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export function StocktakeSessionContent({ stocktakeId }: StocktakeSessionContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const canRead = useHasPermissionStrict(PERMISSION_CODES.STOCK_MOVEMENTS_STOCKTAKE_READ);
  const canManage = useHasPermissionStrict(PERMISSION_CODES.STOCK_MOVEMENTS_STOCKTAKE_MANAGE);
  const summaryQuery = useStocktakeQuery(stocktakeId, canRead);
  const summary = summaryQuery.data;
  const isEditable = summary?.status === 'OPEN' && canManage;
  const stepParam = parseStocktakeStep(searchParams.get('step'));
  const defaultAppliedRef = useRef(false);

  const stepHref = useCallback(
    (step: StocktakeStep) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('step', step);
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams],
  );

  useEffect(() => {
    if (stepParam !== null) {
      defaultAppliedRef.current = false;
      return;
    }
    if (!summary || !isEditable || defaultAppliedRef.current) return;
    defaultAppliedRef.current = true;
    router.replace(stepHref(defaultStocktakeStep(summary)));
  }, [summary, isEditable, stepParam, router, stepHref]);

  useEffect(() => {
    if (!summary || !isEditable || stepParam !== 'count' || summary.lineCount > 0) return;
    router.replace(stepHref('items'));
  }, [summary, isEditable, stepParam, router, stepHref]);

  if (!canRead) {
    return <StocktakeAccessDenied />;
  }

  if (summaryQuery.isError) {
    return (
      <ErrorState
        error={summaryQuery.error}
        fallback="تعذر تحميل جلسة الجرد"
        onRetry={() => summaryQuery.refetch()}
      />
    );
  }

  if (summaryQuery.isLoading || !summary) {
    return <StocktakeSessionSkeleton stocktakeId={stocktakeId} />;
  }

  if (!isEditable) {
    return <StocktakeCountView stocktakeId={stocktakeId} fullScreen={false} />;
  }

  if (stepParam === null) {
    return <StocktakeSessionSkeleton stocktakeId={stocktakeId} />;
  }

  const step: StocktakeStep =
    stepParam === 'count' && summary.lineCount === 0 ? 'items' : stepParam;

  if (step === 'items') {
    return (
      <StocktakeItemsStep
        stocktakeId={stocktakeId}
        summary={summary}
        onNext={() => router.push(stepHref('count'))}
      />
    );
  }

  return (
    <StocktakeCountView
      stocktakeId={stocktakeId}
      fullScreen
      onBack={() => router.push(stepHref('items'))}
    />
  );
}
