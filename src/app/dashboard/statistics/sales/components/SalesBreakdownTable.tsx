'use client';

import { Fragment } from 'react';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatCount, formatMoney } from '@/utils/formatMoney';
import { BREAKDOWN_GROUP_HEADINGS, SALES_COPY } from '../constants';
import type { SalesBreakdownDimension, SalesBreakdownRow, SalesMetrics } from '../types';
import { STICKY_HEADER, STICKY_HEADER_CORNER } from './tableClasses';

interface SalesBreakdownTableProps {
  breakdown: SalesBreakdownRow[];
  totals: SalesMetrics;
}

const DIMENSION_ORDER: SalesBreakdownDimension[] = ['STORE', 'CARRIER', 'PAGE'];

const STICKY_FIRST_COLUMN = 'sticky start-0 z-[1] bg-card';

function metricCells(metrics: SalesMetrics) {
  return [
    formatCount(metrics.totalOrders),
    formatCount(metrics.collectedOrders),
    formatMoney(metrics.suppliedAmount),
    formatCount(metrics.piecesSold),
    formatMoney(metrics.soldPiecesCost),
    formatMoney(metrics.averageOrderPrice),
    formatMoney(metrics.returnsExpense),
    formatMoney(metrics.expenses),
    formatMoney(metrics.netProfit),
  ];
}

export function SalesBreakdownTable({ breakdown, totals }: SalesBreakdownTableProps) {
  const columnCount = SALES_COPY.breakdownColumns.length;

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
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {DIMENSION_ORDER.map((dimension) => {
              const rows = breakdown.filter((row) => row.dimension === dimension);
              if (!rows.length) return null;
              return (
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
                      {metricCells(row.metrics).map((value, index) => (
                        <TableCell key={index} className="tabular-nums text-end">
                          {value}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </Fragment>
              );
            })}
            <TableRow className="border-t-2 border-border font-bold hover:bg-transparent">
              <TableHead scope="row" className={cn('font-bold whitespace-nowrap', STICKY_FIRST_COLUMN)}>
                {SALES_COPY.totalsRowLabel}
              </TableHead>
              {metricCells(totals).map((value, index) => (
                <TableCell key={index} className="tabular-nums text-end">
                  {value}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </table>
      </div>
    </div>
  );
}
