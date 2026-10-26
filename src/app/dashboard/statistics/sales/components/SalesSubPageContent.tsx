'use client';

import Link from 'next/link';
import { AlertCircle, ArrowRight, Download, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportSalesRowsToExcel, type SalesExportCell } from '@/lib/excel/export-sales-statistics';
import {
  useSalesStatisticsFilterOptionsQuery,
  useSalesStatisticsOrdersQuery,
  useSalesStatisticsPiecesQuery,
} from '@/services/salesStatistics';
import { formatCount, formatMoney } from '@/utils/formatMoney';
import {
  SALES_COPY,
  SALES_ORDER_COLUMN_LABELS,
  SALES_SUBPAGE_SETS,
  isSalesOrderSet,
} from '../constants';
import {
  type SalesStatisticsFiltersState,
  useSalesStatisticsFilters,
} from '../hooks/useSalesStatisticsFilters';
import type {
  FilterOption,
  SalesOrderSet,
  SalesStatisticsFilterOptions,
  SalesStatisticsParams,
  SalesSubPageSet,
} from '../types';
import { SalesHeroBar } from './SalesHeroBar';
import { SalesOrdersTable, salesOrderExportValue } from './SalesOrdersTable';
import { SalesPiecesTable, buildSalesPieceExport } from './SalesPiecesTable';
import { StatisticsState } from './StatisticsState';

const EMPTY_PARAMS: SalesStatisticsParams = { from: '', to: '', approvedOnly: true };

const PAGE_CONTAINER = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6';

function labelsFor(options: FilterOption[] | undefined, keys: string[] | undefined): string {
  if (!keys || keys.length === 0) return 'الكل';
  return keys.map((key) => options?.find((option) => option.key === key)?.label ?? key).join('، ');
}

function buildFilterSummary(
  params: SalesStatisticsParams,
  title: string,
  filterOptions: SalesStatisticsFilterOptions | undefined,
): Array<{ label: string; value: string }> {
  return [
    { label: 'القائمة', value: title },
    { label: 'من تاريخ', value: params.from },
    { label: 'إلى تاريخ', value: params.to },
    { label: SALES_COPY.approvedOnlyLabel, value: params.approvedOnly ? 'نعم' : 'لا' },
    {
      label: SALES_COPY.storePlaceholder,
      value: labelsFor(filterOptions?.stores, params.storeIds?.map(String)),
    },
    {
      label: SALES_COPY.carrierPlaceholder,
      value: labelsFor(filterOptions?.carriers, params.carrierKeys),
    },
    { label: SALES_COPY.pagePlaceholder, value: labelsFor(filterOptions?.pages, params.pageNames) },
  ];
}

function SubPageSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-8 bg-muted animate-pulse rounded" />
        ))}
      </div>
    </div>
  );
}

interface SalesSubPageContentProps {
  set: SalesSubPageSet;
  initialFilters: Partial<SalesStatisticsFiltersState>;
}

export function SalesSubPageContent({ set, initialFilters }: SalesSubPageContentProps) {
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
  } = useSalesStatisticsFilters(initialFilters);

  const definition = SALES_SUBPAGE_SETS[set];
  const orderSet: SalesOrderSet | null = isSalesOrderSet(set) ? set : null;
  const requestParams = params ?? EMPTY_PARAMS;

  const ordersQuery = useSalesStatisticsOrdersQuery(
    requestParams,
    orderSet ?? 'TOTAL',
    orderSet !== null && params !== null,
  );
  const piecesQuery = useSalesStatisticsPiecesQuery(
    requestParams,
    orderSet === null && params !== null,
  );
  const filterOptionsQuery = useSalesStatisticsFilterOptionsQuery(true);

  const activeQuery = orderSet !== null ? ordersQuery : piecesQuery;
  const isError = activeQuery.isError;

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
      isFetching={activeQuery.isFetching}
    />
  );

  const backLink = (
    <Link
      href="/dashboard/statistics/sales"
      className="inline-flex w-fit items-center gap-2 rounded text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <ArrowRight className="size-4" aria-hidden="true" />
      {SALES_COPY.backToStatistics}
    </Link>
  );

  let header: React.ReactNode = null;
  let body: React.ReactNode = null;
  let exportHandler: (() => void) | null = null;

  if (orderSet !== null && ordersQuery.data) {
    const data = ordersQuery.data;
    const columns = definition.columns;
    header = (
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold">{definition.title}</h1>
        <p className="text-sm text-muted-foreground">
          {`${SALES_COPY.ordersCountLabel}: ${formatCount(data.summary.count)}`}
          {data.summary.amount !== null &&
            ` · ${SALES_COPY.amountLabel}: ${formatMoney(data.summary.amount)}`}
        </p>
        {data.includesDerived && (
          <p className="text-xs text-muted-foreground">{SALES_COPY.includesDerivedNote}</p>
        )}
      </div>
    );
    body =
      data.rows.length === 0 ? (
        <StatisticsState
          icon={Inbox}
          title={SALES_COPY.subPageEmptyTitle}
          subtitle={SALES_COPY.subPageEmptySubtitle}
        />
      ) : (
        <SalesOrdersTable set={orderSet} rows={data.rows} />
      );
    exportHandler = () => {
      exportSalesRowsToExcel({
        rows: data.rows.map((row) =>
          Object.fromEntries(
            columns.map((column): [string, SalesExportCell] => [
              SALES_ORDER_COLUMN_LABELS[column],
              salesOrderExportValue(row, column),
            ]),
          ),
        ),
        columns: columns.map((column) => SALES_ORDER_COLUMN_LABELS[column]),
        fileName: `sales-${set.toLowerCase()}-${data.range.from}-${data.range.to}`,
        filterSummary: buildFilterSummary(requestParams, definition.title, filterOptionsQuery.data),
      });
    };
  } else if (orderSet === null && piecesQuery.data) {
    const data = piecesQuery.data;
    const piecesExport = buildSalesPieceExport(data.products, definition.withCost);
    header = (
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold">{definition.title}</h1>
        <p className="text-sm text-muted-foreground">
          {`${SALES_COPY.piecesCountLabel}: ${formatCount(data.totals.piecesSold)}`}
          {definition.withCost &&
            ` · ${SALES_COPY.amountLabel}: ${formatMoney(data.totals.soldPiecesCost)}`}
        </p>
      </div>
    );
    body =
      data.products.length === 0 ? (
        <StatisticsState
          icon={Inbox}
          title={SALES_COPY.subPageEmptyTitle}
          subtitle={SALES_COPY.subPageEmptySubtitle}
        />
      ) : (
        <SalesPiecesTable withCost={definition.withCost} products={data.products} />
      );
    exportHandler = () => {
      exportSalesRowsToExcel({
        rows: piecesExport.rows,
        columns: piecesExport.columns,
        fileName: `sales-${set.toLowerCase()}-${data.range.from}-${data.range.to}`,
        filterSummary: buildFilterSummary(requestParams, definition.title, filterOptionsQuery.data),
      });
    };
  } else if (isError) {
    body = (
      <StatisticsState
        icon={AlertCircle}
        title={SALES_COPY.subPageErrorTitle}
        actionLabel={SALES_COPY.errorStateRetry}
        onAction={() => activeQuery.refetch()}
      />
    );
  } else {
    body = <SubPageSkeleton />;
  }

  return (
    <div className={PAGE_CONTAINER}>
      {backLink}
      {heroBar}
      <div className="flex flex-wrap items-start justify-between gap-3">
        {header}
        {exportHandler && (
          <Button variant="outline" onClick={exportHandler} className="gap-2">
            <Download className="size-4" aria-hidden="true" />
            {SALES_COPY.exportLabel}
          </Button>
        )}
      </div>
      {body}
    </div>
  );
}
