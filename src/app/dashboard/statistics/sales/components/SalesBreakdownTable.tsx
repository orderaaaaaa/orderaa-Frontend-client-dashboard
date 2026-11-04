'use client';

import { Fragment } from 'react';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatCount, formatMoney } from '@/utils/formatMoney';
import { moneyCents } from '@/utils/money';
import { BREAKDOWN_COST_HEADER, BREAKDOWN_GROUP_HEADINGS, SALES_COPY } from '../constants';
import type { SalesBreakdownDimension, SalesBreakdownRow, SalesMetrics } from '../types';
import { STICKY_HEADER, STICKY_HEADER_CORNER } from './tableClasses';

interface SalesBreakdownTableProps {
  breakdown: SalesBreakdownRow[];
  totals: SalesMetrics;
}

interface MetricColumn {
  field: keyof SalesMetrics;
  format: (metrics: SalesMetrics) => string;
}

const DIMENSION_ORDER: SalesBreakdownDimension[] = ['STORE', 'CARRIER', 'PAGE'];

const STICKY_FIRST_COLUMN = 'sticky start-0 z-[1] bg-card';
const COST_FIELD: keyof SalesMetrics = 'soldPiecesCost';
const MISSING_VALUE = '—';

const METRIC_COLUMNS: readonly MetricColumn[] = [
  { field: 'totalOrders', format: (metrics) => formatCount(metrics.totalOrders) },
  { field: 'collectedOrders', format: (metrics) => formatCount(metrics.collectedOrders) },
  { field: 'suppliedAmount', format: (metrics) => formatMoney(metrics.suppliedAmount) },
  { field: 'piecesSold', format: (metrics) => formatCount(metrics.piecesSold) },
  { field: COST_FIELD, format: (metrics) => formatMoney(metrics.soldPiecesCost) },
  { field: 'averageOrderPrice', format: (metrics) => formatMoney(metrics.averageOrderPrice) },
  { field: 'returnsExpense', format: (metrics) => formatMoney(metrics.returnsExpense) },
  { field: 'expenses', format: (metrics) => formatMoney(metrics.expenses) },
  { field: 'netProfit', format: (metrics) => formatMoney(metrics.netProfit) },
];

function sumCostOf(rows: SalesBreakdownRow[]): string {
  const cents = rows.reduce(
    (total, row) => total + moneyCents(Number(row.metrics.soldPiecesCost)),
    0,
  );
  return (cents / 100).toFixed(2);
}

export function SalesBreakdownTable({ breakdown, totals }: SalesBreakdownTableProps) {
  const columnCount = SALES_COPY.breakdownColumns.length;
  const groups = DIMENSION_ORDER.map((dimension) => ({
    dimension,
    rows: breakdown.filter((row) => row.dimension === dimension),
  })).filter((group) => group.rows.length > 0);
  const totalsCost = groups.length === 1 ? formatMoney(sumCostOf(groups[0].rows)) : MISSING_VALUE;

  return (
    <div className="bg-card border border-border rounded-2xl">
      <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
        <table className="w-full caption-bottom text-sm">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-0">
              {SALES_COPY.breakdownColumns.map((column, index) => (
                <TableHead
                  key={column}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap',
                    index === 0 ? STICKY_HEADER_CORNER : STICKY_HEADER,
                    index > 0 && 'text-end tabular-nums',
                  )}
                >
                  {column}
                  {column === BREAKDOWN_COST_HEADER && (
                    <span className="block text-[11px] font-normal text-muted-foreground">
                      {SALES_COPY.breakdownCostScopeNote}
                    </span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map(({ dimension, rows }) => (
              <Fragment key={dimension}>
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columnCount}
                    className="bg-muted/50 text-foreground font-semibold"
                  >
                    {BREAKDOWN_GROUP_HEADINGS[dimension]}
                  </TableCell>
                </TableRow>
                {rows.map((row) => (
                  <TableRow key={`${row.dimension}-${row.key}`} className="hover:bg-accent/50">
                    <TableHead
                      scope="row"
                      className={cn('font-normal whitespace-nowrap', STICKY_FIRST_COLUMN)}
                    >
                      {row.label}
                    </TableHead>
                    {METRIC_COLUMNS.map((column) => (
                      <TableCell key={column.field} className="tabular-nums text-end">
                        {column.format(row.metrics)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow className="border-t border-border/60 hover:bg-transparent">
                  <TableHead
                    scope="row"
                    className={cn('font-semibold whitespace-nowrap', STICKY_FIRST_COLUMN)}
                  >
                    {`${SALES_COPY.groupTotalPrefix} ${BREAKDOWN_GROUP_HEADINGS[dimension]}`}
                  </TableHead>
                  {METRIC_COLUMNS.map((column) => (
                    <TableCell key={column.field} className="tabular-nums text-end font-semibold">
                      {column.field === COST_FIELD ? formatMoney(sumCostOf(rows)) : null}
                    </TableCell>
                  ))}
                </TableRow>
              </Fragment>
            ))}
            <TableRow className="border-t-2 border-border font-bold hover:bg-transparent">
              <TableHead scope="row" className={cn('font-bold whitespace-nowrap', STICKY_FIRST_COLUMN)}>
                {SALES_COPY.totalsRowLabel}
              </TableHead>
              {METRIC_COLUMNS.map((column) => (
                <TableCell key={column.field} className="tabular-nums text-end">
                  {column.field === COST_FIELD ? totalsCost : column.format(totals)}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </table>
      </div>
    </div>
  );
}
