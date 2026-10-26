'use client';

import CopyButton from '@/components/ui/copy-button';
import CopyableCode from '@/components/ui/copyable-code';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ORDER_STATUS_ARABIC_LABELS } from '@/app/dashboard/constants/statusMappings';
import type { SalesExportCell } from '@/lib/excel/export-sales-statistics';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime } from '@/utils/format';
import { formatMoney } from '@/utils/formatMoney';
import {
  SALES_DERIVED_KIND_LABELS,
  SALES_ORDER_COLUMN_LABELS,
  SALES_SUBPAGE_SETS,
  type SalesOrderColumn,
} from '../constants';
import type { SalesOrderRow, SalesOrderSet } from '../types';

interface SalesOrdersTableProps {
  set: SalesOrderSet;
  rows: SalesOrderRow[];
}

const MONEY_COLUMNS: ReadonlySet<SalesOrderColumn> = new Set<SalesOrderColumn>([
  'totalCost',
  'settlementAmount',
  'amount',
  'shippingCost',
]);

const STICKY_HEADER = 'sticky top-0 z-10 bg-card/95 backdrop-blur text-muted-foreground text-xs';

function joinStoreAndPage(row: SalesOrderRow): string | null {
  const parts = [row.storeName, row.pageName].filter((part): part is string => Boolean(part));
  return parts.length ? parts.join(' / ') : null;
}

function negateMoney(value: string | null): string | null {
  return value === null ? null : (-Number(value)).toFixed(2);
}

function salesOrderText(row: SalesOrderRow, column: SalesOrderColumn): string | null {
  switch (column) {
    case 'code':
      return row.code;
    case 'customerName':
      return row.customerName;
    case 'governorate':
      return row.governorate;
    case 'city':
      return row.city;
    case 'totalCost':
      return row.totalCost;
    case 'carrierName':
      return row.carrierName;
    case 'storeOrPage':
      return joinStoreAndPage(row);
    case 'createdAt':
      return formatDate(row.createdAt);
    case 'status':
      return ORDER_STATUS_ARABIC_LABELS[row.status] ?? row.status;
    case 'legCode':
      return row.legCode;
    case 'shippingCode':
      return row.shippingCode;
    case 'settlementAmount':
      return row.settlementAmount;
    case 'amount':
      return negateMoney(row.settlementAmount);
    case 'shippingCost':
      return row.shippingCost;
    case 'settlementCode':
      return row.settlementCode;
    case 'settlementRecordedAt':
      return row.settlementRecordedAt ? formatDateTime(row.settlementRecordedAt) : null;
    case 'cancelReason':
      return row.cancelReason;
    case 'cancelNotes':
      return row.cancelNotes;
  }
}

export function salesOrderExportValue(row: SalesOrderRow, column: SalesOrderColumn): SalesExportCell {
  const text = salesOrderText(row, column);
  if (MONEY_COLUMNS.has(column)) return text === null ? null : Number(text);
  return text;
}

function isCopyableColumn(set: SalesOrderSet, column: SalesOrderColumn): boolean {
  if (column === 'code' || column === 'settlementCode') return true;
  if (column === 'shippingCode') return set !== 'RETURNS';
  return false;
}

function plainCopyLabelOf(set: SalesOrderSet, column: SalesOrderColumn): string | null {
  if (column === 'legCode') return 'نسخ كود الفرع';
  if (column === 'shippingCode' && set === 'RETURNS') return 'نسخ كود الشحن';
  return null;
}

function renderOrderCell(row: SalesOrderRow, column: SalesOrderColumn, set: SalesOrderSet) {
  const text = salesOrderText(row, column);
  if (MONEY_COLUMNS.has(column)) return formatMoney(text);
  if (text === null || text === '') return '—';

  const copyLabel = plainCopyLabelOf(set, column);
  if (copyLabel) {
    return (
      <CopyableCode value={text} label={copyLabel}>
        <span dir="ltr">{text}</span>
      </CopyableCode>
    );
  }

  const label = SALES_ORDER_COLUMN_LABELS[column];
  const copyable = isCopyableColumn(set, column);
  const derivedBadge =
    column === 'code' && row.derivedKind ? (
      <span className="ms-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
        {SALES_DERIVED_KIND_LABELS[row.derivedKind]}
      </span>
    ) : null;

  if (!copyable && !derivedBadge) return text;

  return (
    <span className="inline-flex items-center gap-2">
      {copyable ? (
        <>
          <span dir="ltr">{text}</span>
          <CopyButton value={text} label={`نسخ ${label}`} successMessage={`تم نسخ ${label}`} />
        </>
      ) : (
        text
      )}
      {derivedBadge}
    </span>
  );
}

export function SalesOrdersTable({ set, rows }: SalesOrdersTableProps) {
  const columns = SALES_SUBPAGE_SETS[set].columns;

  return (
    <div className="bg-card border border-border rounded-2xl">
      <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
        <table className="w-full caption-bottom text-sm">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-0">
              {columns.map((column) => (
                <TableHead
                  key={column}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap',
                    STICKY_HEADER,
                    MONEY_COLUMNS.has(column) && 'text-end tabular-nums',
                  )}
                >
                  {SALES_ORDER_COLUMN_LABELS[column]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.orderId} className="hover:bg-accent/50">
                {columns.map((column) => (
                  <TableCell
                    key={column}
                    className={cn(
                      'whitespace-nowrap',
                      MONEY_COLUMNS.has(column) && 'tabular-nums text-end',
                    )}
                  >
                    {renderOrderCell(row, column, set)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>
    </div>
  );
}
