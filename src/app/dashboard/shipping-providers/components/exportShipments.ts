import { toast } from 'react-toastify';
import { exportRowsToExcel, type ExportCell, type ExportFilterEntry } from '@/lib/excel/export-rows';
import type { TranslationKey, TranslationParams } from '@/i18n/translate';
import type { FollowupClosure } from '@/types/logistics';
import type {
  CarrierHeader,
  DeliveredShipment,
  InProcessShipment,
  ReturnedShipment,
  ShipmentRowBase,
} from '@/types/shippingProviders';
import { formatDate, formatTime } from '@/utils/format';
import { deliveryWindowTextOf } from './ShipmentsTable';
import { formatNumber } from './formatNumber';
import { latenessChipOf } from './LatenessChip';
import { CLOSURE_KIND_LABEL_KEYS, closureReasonOf } from './ShipmentRowActions';

export const EXPORT_ROW_CAP = 5000;
const EXPORT_PAGE_SIZE = 100;
const EXPORT_PAGES_IN_FLIGHT = 4;
const EMPTY_TEXT = '—';
const PHONE_SEPARATOR = '، ';
const DATE_TIME_SEPARATOR = '، ';

type Translate = (key: TranslationKey, params?: TranslationParams) => string;
type StatusLabel = (statusKey: string | null | undefined) => string;

export interface ExportColumn<Row> {
  header: string;
  value: (row: Row) => ExportCell;
}

export interface ExportPage<Row> {
  data: Row[];
  total: number;
  carrier: CarrierHeader;
}

export type ExportPageFetcher<Row> = (page: number, limit: number) => Promise<ExportPage<Row>>;

export async function fetchAllPages<Row extends { id: number }>(
  fetchPage: ExportPageFetcher<Row>,
): Promise<{ rows: Row[]; total: number; carrier: CarrierHeader }> {
  const first = await fetchPage(1, EXPORT_PAGE_SIZE);
  const pageCount = Math.ceil(Math.min(first.total, EXPORT_ROW_CAP) / EXPORT_PAGE_SIZE);
  const rowsById = new Map<number, Row>(first.data.map((row): [number, Row] => [row.id, row]));
  const laterPages = Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) => index + 2);
  for (let start = 0; start < laterPages.length; start += EXPORT_PAGES_IN_FLIGHT) {
    const batch = laterPages.slice(start, start + EXPORT_PAGES_IN_FLIGHT);
    const pages = await Promise.all(batch.map((page) => fetchPage(page, EXPORT_PAGE_SIZE)));
    pages.forEach((page) => page.data.forEach((row) => rowsById.set(row.id, row)));
  }
  return { rows: Array.from(rowsById.values()), total: first.total, carrier: first.carrier };
}

const absoluteDateTextOf = (value: string | null): string =>
  value === null ? EMPTY_TEXT : `${formatDate(value)}${DATE_TIME_SEPARATOR}${formatTime(value)}`;

const dayTextOf = (value: string | null): string => formatDate(value);

const addressTextOf = (row: Pick<ShipmentRowBase, 'governorate' | 'city'>): string =>
  [row.governorate, row.city].filter(Boolean).join(' - ') || EMPTY_TEXT;

const closureTextOf = (closure: FollowupClosure | null, t: Translate): string => {
  if (closure === null) return EMPTY_TEXT;
  return [t(CLOSURE_KIND_LABEL_KEYS[closure.kind]), closureReasonOf(closure)].filter(Boolean).join(' - ');
};

const latenessTextOf = (lateness: InProcessShipment['lateness'], t: Translate): string => {
  const chip = latenessChipOf(lateness, t);
  return [chip.text, chip.daysLateText].filter(Boolean).join(' - ');
};

const netTextOf = (row: InProcessShipment, t: Translate): ExportCell => {
  if (row.netAmount === undefined) return EMPTY_TEXT;
  if (row.shippingCostUnknown === true) return t('inProcess.net.unknownShippingCost');
  return Number(row.netAmount);
};

const leadingColumns = <Row extends ShipmentRowBase>(t: Translate, statusLabel: StatusLabel): ExportColumn<Row>[] => [
  { header: t('inProcess.table.columns.code'), value: (row) => row.code },
  { header: t('inProcess.table.columns.customer'), value: (row) => row.customer.name ?? EMPTY_TEXT },
  {
    header: t('inProcess.export.columns.phones'),
    value: (row) => row.customer.phones.join(PHONE_SEPARATOR) || EMPTY_TEXT,
  },
  { header: t('inProcess.table.columns.products'), value: (row) => row.lineCount },
  { header: t('inProcess.table.columns.status'), value: (row) => statusLabel(row.status) },
  { header: t('inProcess.export.columns.closure'), value: (row) => closureTextOf(row.closure, t) },
];

export function inProcessExportColumns(
  t: Translate,
  statusLabel: StatusLabel,
  hasNet: boolean,
): ExportColumn<InProcessShipment>[] {
  const columns: ExportColumn<InProcessShipment>[] = [
    ...leadingColumns<InProcessShipment>(t, statusLabel),
    { header: t('inProcess.table.columns.due'), value: (row) => dayTextOf(row.lateness?.dueDay ?? null) },
    { header: t('inProcess.export.columns.lateness'), value: (row) => latenessTextOf(row.lateness, t) },
    { header: t('inProcess.table.columns.takenAt'), value: (row) => absoluteDateTextOf(row.takenAt) },
    {
      header: t('inProcess.table.columns.window'),
      value: (row) => deliveryWindowTextOf(row.availableFrom, row.availableTo),
    },
    { header: t('inProcess.table.columns.address'), value: (row) => addressTextOf(row) },
    { header: t('inProcess.table.columns.courier'), value: (row) => row.courierName ?? EMPTY_TEXT },
    { header: t('inProcess.export.columns.courierPhone'), value: (row) => row.courierPhone ?? EMPTY_TEXT },
    { header: t('inProcess.table.columns.total'), value: (row) => row.totalCost },
  ];
  if (hasNet) columns.push({ header: t('inProcess.table.columns.net'), value: (row) => netTextOf(row, t) });
  return columns;
}

export function returnedExportColumns(t: Translate, statusLabel: StatusLabel): ExportColumn<ReturnedShipment>[] {
  return [
    ...leadingColumns<ReturnedShipment>(t, statusLabel),
    {
      header: t('inProcess.table.columns.returnedAt'),
      value: (row) => absoluteDateTextOf(row.returnedAt),
    },
    { header: t('inProcess.table.columns.takenAt'), value: (row) => absoluteDateTextOf(row.takenAt) },
    { header: t('inProcess.table.columns.address'), value: (row) => addressTextOf(row) },
    { header: t('inProcess.table.columns.total'), value: (row) => row.totalCost },
  ];
}

export function deliveredExportColumns(t: Translate, statusLabel: StatusLabel): ExportColumn<DeliveredShipment>[] {
  return [
    ...leadingColumns<DeliveredShipment>(t, statusLabel),
    {
      header: t('inProcess.table.columns.deliveredAt'),
      value: (row) => absoluteDateTextOf(row.deliveredAt),
    },
    { header: t('inProcess.table.columns.takenAt'), value: (row) => absoluteDateTextOf(row.takenAt) },
    { header: t('inProcess.table.columns.address'), value: (row) => addressTextOf(row) },
    { header: t('inProcess.table.columns.courier'), value: (row) => row.courierName ?? EMPTY_TEXT },
    { header: t('inProcess.export.columns.courierPhone'), value: (row) => row.courierPhone ?? EMPTY_TEXT },
    { header: t('inProcess.table.columns.total'), value: (row) => row.totalCost },
  ];
}

export interface ExportShipmentsInput<Row extends { id: number }> {
  t: Translate;
  fileName: string;
  columns: ExportColumn<Row>[];
  fetchPage: ExportPageFetcher<Row>;
  buildFilterSummary: (carrierName: string, rowCount: number) => ExportFilterEntry[];
}

export async function exportShipmentsToExcel<Row extends { id: number }>({
  t,
  fileName,
  columns,
  fetchPage,
  buildFilterSummary,
}: ExportShipmentsInput<Row>): Promise<void> {
  const fetched = await fetchAllPages(fetchPage).catch(() => null);
  if (fetched === null) {
    toast.error(t('inProcess.export.failed'));
    return;
  }
  if (fetched.rows.length === 0) {
    toast.info(t('inProcess.export.empty'));
    return;
  }
  const rows = fetched.rows.map((row) =>
    Object.fromEntries(columns.map((column): [string, ExportCell] => [column.header, column.value(row)])),
  );
  const written = exportRowsToExcel({
    rows,
    columns: columns.map((column) => column.header),
    fileName,
    filterSummary: buildFilterSummary(fetched.carrier.name, rows.length),
  });
  if (written && fetched.total > EXPORT_ROW_CAP) {
    toast.warning(
      t('inProcess.export.capped', {
        exported: formatNumber(rows.length),
        total: formatNumber(fetched.total),
      }),
    );
  }
}
