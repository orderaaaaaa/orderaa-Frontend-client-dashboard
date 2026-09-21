'use client';

import { useEffect, useRef } from 'react';
import { AlertCircle, Inbox } from 'lucide-react';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '@/utils/apiError';
import { computeTrend } from '@/utils/computeTrend';
import { formatCount, formatMoney } from '@/utils/formatMoney';
import { KpiCard, KpiCardSkeleton, KpiSection } from '@/components/ui/kpi-card';
import {
  useSalesStatisticsFilterOptionsQuery,
  useSalesStatisticsQuery,
} from '@/services/salesStatistics';
import {
  SALES_CARDS,
  SALES_COPY,
  formatTrendAriaLabel,
  formatTrendTooltip,
  resolveCardContextChip,
  resolveSalesViewState,
  resolveTrendTone,
  type SalesCardDefinition,
} from '../constants';
import { useSalesStatisticsFilters } from '../hooks/useSalesStatisticsFilters';
import { SalesHeroBar } from './SalesHeroBar';
import { SalesBreakdownTable } from './SalesBreakdownTable';
import { StatisticsState } from './StatisticsState';
import type { SalesStatisticsParams, SalesStatisticsResponse } from '../types';

const EMPTY_PARAMS: SalesStatisticsParams = { from: '', to: '', approvedOnly: true };

const PAGE_CONTAINER = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6';

function BreakdownTableSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="h-4 w-40 bg-muted animate-pulse rounded" />
      <div className="mt-4 flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-8 bg-muted animate-pulse rounded" />
        ))}
      </div>
    </div>
  );
}

export function SalesStatisticsContent() {
  const {
    params,
    fromDate,
    toDate,
    timePeriod,
    storeIds,
    carrierKeys,
    pageNames,
    approvedOnly,
    selectionCount,
    setFromDate,
    setToDate,
    setTimePeriod,
    setStoreIds,
    setCarrierKeys,
    setPageNames,
    setApprovedOnly,
    clearScope,
  } = useSalesStatisticsFilters();

  const statsQuery = useSalesStatisticsQuery(params ?? EMPTY_PARAMS, params !== null);
  const filterOptionsQuery = useSalesStatisticsFilterOptionsQuery(true);

  const lastGoodDataRef = useRef<SalesStatisticsResponse | null>(null);
  useEffect(() => {
    if (statsQuery.data) lastGoodDataRef.current = statsQuery.data;
  }, [statsQuery.data]);

  const statsErrorStatus = (
    statsQuery.error as { response?: { status?: number } } | null
  )?.response?.status;

  useEffect(() => {
    if (statsErrorStatus === 400) {
      toast.error(getApiErrorMessage(statsQuery.error, SALES_COPY.errorStateTitle));
    }
  }, [statsQuery.error, statsErrorStatus]);

  const activeData =
    statsQuery.data ?? (statsErrorStatus === 400 ? lastGoodDataRef.current : null);
  const resolvedError =
    statsErrorStatus && statsErrorStatus !== 400 ? { status: statsErrorStatus } : null;

  const viewState = resolveSalesViewState({
    hasPermission: true,
    isLoading: statsQuery.isLoading,
    isFetching: statsQuery.isFetching,
    data: activeData,
    error: resolvedError,
  });

  const heroBar = (
    <SalesHeroBar
      fromDate={fromDate}
      toDate={toDate}
      timePeriod={timePeriod}
      onFromDateChange={setFromDate}
      onToDateChange={setToDate}
      onTimePeriodChange={setTimePeriod}
      storeIds={storeIds}
      carrierKeys={carrierKeys}
      pageNames={pageNames}
      onStoreIdsChange={setStoreIds}
      onCarrierKeysChange={setCarrierKeys}
      onPageNamesChange={setPageNames}
      approvedOnly={approvedOnly}
      onApprovedOnlyChange={setApprovedOnly}
      onClearScope={clearScope}
      selectionCount={selectionCount}
      filterOptions={filterOptionsQuery.data}
      filterOptionsLoading={filterOptionsQuery.isLoading}
      filterOptionsError={filterOptionsQuery.isError}
      isFetching={statsQuery.isFetching}
    />
  );

  if (viewState === 'no-access') {
    return (
      <div className={PAGE_CONTAINER}>
        <StatisticsState title={SALES_COPY.noAccessTitle} />
      </div>
    );
  }

  if (viewState === 'error') {
    return (
      <div className={PAGE_CONTAINER}>
        {heroBar}
        <StatisticsState
          icon={AlertCircle}
          title={SALES_COPY.errorStateTitle}
          actionLabel={SALES_COPY.errorStateRetry}
          onAction={() => statsQuery.refetch()}
        />
      </div>
    );
  }

  if (viewState === 'first-load') {
    return (
      <div className={PAGE_CONTAINER}>
        {heroBar}
        <KpiSection title={SALES_COPY.sectionLabels.sales} columns={4}>
          {SALES_CARDS.slice(0, 4).map((card) => (
            <KpiCardSkeleton key={card.field} />
          ))}
        </KpiSection>
        <KpiSection title={SALES_COPY.sectionLabels.cost} columns={4}>
          {SALES_CARDS.slice(4).map((card) => (
            <KpiCardSkeleton key={card.field} />
          ))}
        </KpiSection>
        {selectionCount > 0 && <BreakdownTableSkeleton />}
      </div>
    );
  }

  const data = activeData;
  if (!data) {
    return <div className={PAGE_CONTAINER}>{heroBar}</div>;
  }

  const { totals, previousTotals, previousRange, breakdown, approvedOnly: dataApprovedOnly } =
    data;
  const isDimmed = viewState === 'refetch';
  const isEmpty = totals.totalOrders === 0 && totals.purchasesTotal === '0.00';

  const renderCard = (card: SalesCardDefinition) => {
    const value = totals[card.field];
    const previousValue = previousTotals[card.field];
    const trendResult = computeTrend(value, previousValue);
    const trend = trendResult
      ? {
          direction: trendResult.direction,
          percent: trendResult.percent,
          tone: resolveTrendTone(card.neutralTrend, trendResult.direction),
          tooltip: formatTrendTooltip(previousRange),
          ariaLabel: formatTrendAriaLabel(trendResult.direction, trendResult.percent),
        }
      : undefined;
    const chip = resolveCardContextChip(card.field, totals, dataApprovedOnly);
    const Icon = card.icon;

    return (
      <KpiCard
        key={card.field}
        label={card.label}
        value={
          card.kind === 'count'
            ? formatCount(value as number)
            : formatMoney(value as string | null)
        }
        hint={card.hint}
        icon={<Icon size={20} aria-hidden="true" />}
        accent={card.accent}
        chip={chip}
        trend={trend}
        dimmed={isDimmed}
      />
    );
  };

  return (
    <div className={PAGE_CONTAINER}>
      {heroBar}
      <KpiSection title={SALES_COPY.sectionLabels.sales} columns={4}>
        {SALES_CARDS.slice(0, 4).map(renderCard)}
      </KpiSection>
      <KpiSection title={SALES_COPY.sectionLabels.cost} columns={4}>
        {SALES_CARDS.slice(4).map(renderCard)}
      </KpiSection>
      {breakdown.length > 0 && <SalesBreakdownTable breakdown={breakdown} totals={totals} />}
      {isEmpty && (
        <StatisticsState
          icon={Inbox}
          title={SALES_COPY.emptyStateTitle}
          subtitle={SALES_COPY.emptyStateSubtitle}
        />
      )}
    </div>
  );
}
