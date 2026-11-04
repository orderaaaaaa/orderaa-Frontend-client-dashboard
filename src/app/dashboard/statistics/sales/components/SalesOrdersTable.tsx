'use client';

import CopyButton from '@/components/ui/copy-button';
import CopyableCode from '@/components/ui/copyable-code';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ORDER_STATUS_ARABIC_LABELS } from '@/app/dashboard/constants/statusMappings';
import type { SalesExportCell } from '@/lib/excel/export-sales-statistics';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime } from '@/utils/format';
import { OrderStatus } from '@/types/orders';
import { formatMoney } from '@/utils/formatMoney';
import { getTimeAgoCompact, toCairoDayKey } from '@/utils/timeAgo';
import {
  SALES_DERIVED_KIND_LABELS,
  SALES_EXCLUSION_REASON_LABELS,
  SALES_ORDER_COLUMN_LABELS,
  SALES_SUBPAGE_SETS,
  type SalesOrderColumn,
} from '../constants';
import type { SalesOrderRow, SalesOrderSet } from '../types';
import { STICKY_BODY_START, STICKY_HEADER, STICKY_HEADER_CORNER } from './tableClasses';

interface SalesOrdersTableProps {
  set: SalesOrderSet;
  rows: SalesOrderRow[];
}

const MONEY_COLUMNS: ReadonlySet<SalesOrderColumn> = new Set<SalesOrderColumn>([
  'totalCost',
  'settlementAmount',
  'amount',
  'shippingCost',
  'collectedAmount',
  'governorateFee',
  'productsCost',
  'pendingProfit',
]);


const WRAPPING_COLUMNS: ReadonlySet<SalesOrderColumn> = new Set<SalesOrderColumn>([
  'customerName',
  'customerPhone',
  'governorate',
  'city',
  'carrierName',
  'storeOrPage',
  'confirmedBy',
  'cancelReason',
  'cancelNotes',
  'returnReason',
  'returnNotes',
  'shippingCancelReason',
  'shippingCancelNotes',
  'exclusionReason',
]);

function wrappingCellClass(column: SalesOrderColumn): string | false {
  if (!WRAPPING_COLUMNS.has(column)) return false;
  const minWidth = column === 'customerPhone' ? 'min-w-[8.5rem]' : 'min-w-[7rem]';
  return cn('whitespace-normal max-w-[14rem] break-words', minWidth);
}

function renderPhoneNumbers(phoneList: string) {
  const numbers = phoneList
    .split(',')
    .map((number) => number.trim())
    .filter((number) => number !== '');
  return (
    <div className="flex flex-col gap-1 pe-[13px]">
      {numbers.map((number) => (
        <span key={number} className="inline-flex items-center gap-2 [overflow-wrap:anywhere]">
          <span dir="ltr">{number}</span>
          <CopyButton
            value={number}
            label="نسخ رقم الهاتف"
            successMessage="تم نسخ رقم الهاتف"
          />
        </span>
      ))}
    </div>
  );
}

function joinStoreAndPage(row: SalesOrderRow): string | null {
  const parts = [row.storeName, row.pageName].filter((part): part is string => Boolean(part));
  return parts.length ? parts.join(' / ') : null;
}

function negateMoney(value: string | null): string | null {
  return value === null ? null : (-Number(value)).toFixed(2);
}

function deliveredAtText(row: SalesOrderRow): string | null {
  if (row.status === OrderStatus.COLLECTED) return 'تم التحصيل';
  if (!row.deliveredAt) return null;
  return getTimeAgoCompact(toCairoDayKey(row.deliveredAt)) || null;
}

function deliveredAtExportText(row: SalesOrderRow): string | null {
  if (row.status === OrderStatus.COLLECTED) return 'تم التحصيل';
  return toCairoDayKey(row.deliveredAt);
}

function salesOrderText(row: SalesOrderRow, column: SalesOrderColumn): string | null {
  switch (column) {
    case 'code':
      return row.code;
    case 'customerName':
      return row.customerName;
    case 'customerPhone':
      return row.customerPhone;
    case 'deliveredAt':
      return deliveredAtText(row);
    case 'collectedAmount':
      return row.collectedAmount;
    case 'isCollected':
      return row.isCollected ? 'نعم' : 'لا';
    case 'confirmedBy':
      return row.confirmedByName;
    case 'returnReason':
      return row.returnReason;
    case 'returnNotes':
      return row.returnNotes;
    case 'shippingCancelReason':
      return row.shippingCancelReason;
    case 'shippingCancelNotes':
      return row.shippingCancelNotes;
    case 'governorateFee':
      return row.governorateFee;
    case 'productsCost':
      return row.productsCost;
    case 'pendingProfit':
      return row.pendingProfit;
    case 'exclusionReason':
      return row.exclusionReason ? SALES_EXCLUSION_REASON_LABELS[row.exclusionReason] : null;
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
  if (column === 'deliveredAt') return deliveredAtExportText(row) || '—';
  const text = salesOrderText(row, column);
  if (MONEY_COLUMNS.has(column)) return text ? Number(text) : '—';
  return text || '—';
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
  if (column === 'customerPhone') return renderPhoneNumbers(text);

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
      <span className="whitespace-nowrap rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
        {SALES_DERIVED_KIND_LABELS[row.derivedKind]}
      </span>
    ) : null;

  if (!copyable && !derivedBadge) return text;

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      {copyable ? (
        <>
          <span dir="ltr" className="whitespace-nowrap">
            {text}
          </span>
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
        <table className="w-full min-w-[640px] caption-bottom text-sm">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-0">
              {columns.map((column, index) => (
                <TableHead
                  key={column}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap',
                    index === 0 ? STICKY_HEADER_CORNER : STICKY_HEADER,
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
              <TableRow key={row.orderId} className="group hover:bg-accent/50">
                {columns.map((column, index) => (
                  <TableCell
                    key={column}
                    className={cn(
                      'whitespace-nowrap',
                      index === 0 && STICKY_BODY_START,
                      MONEY_COLUMNS.has(column) && 'tabular-nums text-end',
                      wrappingCellClass(column),
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
