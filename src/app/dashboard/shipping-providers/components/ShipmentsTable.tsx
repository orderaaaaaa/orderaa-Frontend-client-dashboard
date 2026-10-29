'use client';

import { useState } from 'react';
import { Can } from '@/components/Can';
import BaseModal from '@/components/ui/base-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import CopyButton from '@/components/ui/copy-button';
import CopyableCode from '@/components/ui/copyable-code';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDisplayTime } from '@/components/OrderDetails/fields/TimeRangeField';
import { usePermissionCheck } from '@/hooks/usePermissions';
import useShippingCompanies from '@/hooks/useShippingCompanies';
import { useI18n } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/translate';
import { PERMISSIONS } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import type { FollowupClosure } from '@/types/logistics';
import { OrderStatus } from '@/types/orders';
import { PARTIAL_DELIVERY_IMPLEMENTATIONS, type ShippingImplementation } from '@/types/shippingCompanies';
import {
  IN_PROCESS_STATUSES,
  type InProcessShipment,
  type LatenessOverride,
  type ReturnedShipment,
  type ShipmentRowBase,
} from '@/types/shippingProviders';
import { getTimeAgoCompact } from '@/utils/timeAgo';
import { formatDate, formatNumber } from './formatNumber';
import { LatenessChip, latenessChipOf, type LatenessChipModel } from './LatenessChip';
import { CLOSURE_KIND_LABEL_KEYS, ShipmentRowActions, closureReasonOf } from './ShipmentRowActions';
import { SendAgainAction } from './SendAgainAction';
import { ShipmentStatusBadge } from './ShipmentStatusBadge';

const OVERRIDE_LABEL_KEYS: Record<LatenessOverride, TranslationKey> = {
  LATE: 'inProcess.lateness.manualLate',
  ON_TIME: 'inProcess.lateness.manualOnTime',
};

const HEAD_CLASS = 'whitespace-nowrap bg-muted px-3 py-2.5 text-start font-medium text-foreground';
const CELL_CLASS = 'px-3 py-2.5 align-top text-sm text-foreground';
const SECONDARY_TEXT_CLASS = 'text-xs text-muted-foreground';
const STICKY_CELL_CLASS = 'sticky z-[1] bg-card group-hover:bg-muted';
const ROW_CLASS = 'group border-b transition-colors duration-150 hover:bg-surface-hover/40';

export const isLockedRow = (row: ShipmentRowBase): boolean =>
  row.closure?.kind === 'REFUSE' ||
  row.closure?.kind === 'CANCEL' ||
  !(IN_PROCESS_STATUSES as readonly OrderStatus[]).includes(row.status);

const PARTIAL_DELIVERY_BLOCK_REASON_KEYS = {
  carrier: 'inProcess.reason.partialCarrier',
  locked: 'inProcess.reason.locked',
  status: 'inProcess.reason.partialStatus',
} as const satisfies Record<string, TranslationKey>;

export const partialDeliveryBlockReasonOf = ({
  isPartialCarrier,
  locked,
  status,
}: {
  isPartialCarrier: boolean;
  locked: boolean;
  status: OrderStatus;
}): TranslationKey | null => {
  if (!isPartialCarrier) return PARTIAL_DELIVERY_BLOCK_REASON_KEYS.carrier;
  if (locked) return PARTIAL_DELIVERY_BLOCK_REASON_KEYS.locked;
  if (status !== OrderStatus.WITH_DRIVER) return PARTIAL_DELIVERY_BLOCK_REASON_KEYS.status;
  return null;
};

export const moneyTextOf = (value: number | string | null | undefined): string =>
  value === null || value === undefined ? '—' : `${formatNumber(value, 2)} جنيه`;

export const deliveryWindowTextOf = (from: string | null, to: string | null): string =>
  from && to ? `${formatDisplayTime(from)} - ${formatDisplayTime(to)}` : '—';

export function useInProcessCarrier(shippingCompanyId: number) {
  const { shippingCompanies, isLoading } = useShippingCompanies();
  const implementation: ShippingImplementation | undefined = shippingCompanies.find(
    (company) => company.id === shippingCompanyId,
  )?.implementation;
  const isPartialCarrier = implementation !== undefined && PARTIAL_DELIVERY_IMPLEMENTATIONS.includes(implementation);
  return { implementation, isPartialCarrier, isShippingCompaniesLoading: isLoading };
}

export type InProcessCarrier = ReturnType<typeof useInProcessCarrier>;

export function useIsBulkClosable(): (row: ShipmentRowBase) => boolean {
  const { hasPermission } = usePermissionCheck();
  const canCloseToday = hasPermission(PERMISSIONS.FOLLOWUP_CARRIERS_CLOSE_MANAGE);
  return (row) => row.closure === null && canCloseToday;
}

export function CodeCell({ code }: { code: string }) {
  return (
    <CopyableCode value={code} label="نسخ كود الطلب">
      <span className="font-mono font-semibold text-foreground">{code}</span>
    </CopyableCode>
  );
}

export function PhoneCell({ phones }: { phones: string[] }) {
  const { t } = useI18n();
  const [isListOpen, setIsListOpen] = useState(false);
  const [first] = phones;

  if (first === undefined) return <span>—</span>;

  return (
    <div className="flex items-center gap-1">
      <span dir="ltr" className="font-mono whitespace-nowrap">
        {first}
      </span>
      <CopyButton value={first} label={t('inProcess.table.copyPhone')} successMessage="تم نسخ الرقم" />
      {phones.length > 1 && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            aria-label={t('inProcess.table.morePhones', { n: phones.length })}
            onClick={() => setIsListOpen(true)}
          >
            +{phones.length - 1}
          </Button>
          <BaseModal
            isOpen={isListOpen}
            onClose={() => setIsListOpen(false)}
            title="أرقام الهاتف"
            showFooter={false}
            maxWidth="md:max-w-sm"
          >
            <ul className="flex flex-col gap-2">
              {phones.map((phone) => (
                <li key={phone} className="flex items-center justify-between gap-2">
                  <span dir="ltr" className="font-mono">
                    {phone}
                  </span>
                  <CopyButton value={phone} label={t('inProcess.table.copyPhone')} successMessage="تم نسخ الرقم" />
                </li>
              ))}
            </ul>
          </BaseModal>
        </>
      )}
    </div>
  );
}

export function CustomerCell({ name, phones }: { name: string | null; phones: string[] }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="font-medium">{name ?? '—'}</span>
      <PhoneCell phones={phones} />
    </div>
  );
}

export function StatusCell({ status, closure }: { status: OrderStatus; closure: FollowupClosure | null }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-start gap-1.5">
      <ShipmentStatusBadge status={status} />
      {closure !== null && (
        <div className="flex flex-col items-start gap-0.5">
          <Badge variant="outline" className={closure.kind === 'CLOSED_TODAY' ? 'text-muted-foreground' : 'text-destructive'}>
            {t(CLOSURE_KIND_LABEL_KEYS[closure.kind])}
          </Badge>
          {closureReasonOf(closure) && <span className={SECONDARY_TEXT_CLASS}>{closureReasonOf(closure)}</span>}
        </div>
      )}
    </div>
  );
}

export function DueCell({
  model,
  dueDay,
  override,
}: {
  model: LatenessChipModel;
  dueDay: string | null;
  override: LatenessOverride | null;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-start gap-1">
      <LatenessChip model={model} />
      {dueDay ? (
        <div className="flex flex-col">
          <span className="whitespace-nowrap">{formatDate(dueDay)}</span>
          <span className={cn(SECONDARY_TEXT_CLASS, 'whitespace-nowrap')}>{getTimeAgoCompact(dueDay)}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      )}
      {override !== null && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="inline-flex rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
              <Badge variant="outline" className="text-primary">
                {t('inProcess.lateness.manual')}
              </Badge>
            </span>
          </TooltipTrigger>
          <TooltipContent>{t(OVERRIDE_LABEL_KEYS[override])}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export function CourierCell({ name, phone }: { name: string | null; phone: string | null }) {
  if (name === null && phone === null) return <span>—</span>;

  return (
    <div className="flex flex-col">
      <span className="whitespace-nowrap">{name ?? '—'}</span>
      {phone && (
        <span dir="ltr" className={cn(SECONDARY_TEXT_CLASS, 'font-mono whitespace-nowrap')}>
          {phone}
        </span>
      )}
    </div>
  );
}

export interface ShipmentSelection {
  selectedIds: ReadonlySet<number>;
  onToggle: (id: number) => void;
  onToggleAll: (ids: number[], checked: boolean) => void;
}

export function ShipmentSelectCheckbox({
  code,
  checked,
  onCheckedChange,
}: {
  code: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const { t } = useI18n();
  return (
    <Checkbox
      aria-label={t('inProcess.select.row', { code })}
      checked={checked}
      onCheckedChange={(value) => onCheckedChange(value === true)}
    />
  );
}

export function InProcessRowActions({
  row,
  shippingCompanyId,
  carrier,
  onOpenNotes,
  onOpenActionLog,
}: {
  row: InProcessShipment;
  shippingCompanyId: number;
  carrier: InProcessCarrier;
  onOpenNotes: (orderId: number) => void;
  onOpenActionLog: (orderId: number) => void;
}) {
  const { t } = useI18n();
  const locked = isLockedRow(row);
  const partialBlockKey = partialDeliveryBlockReasonOf({
    isPartialCarrier: carrier.isPartialCarrier,
    locked,
    status: row.status,
  });

  return (
    <ShipmentRowActions
      orderId={row.id}
      orderCode={row.code}
      customerName={row.customer.name}
      status={row.status}
      closure={row.closure}
      carrierImplementation={carrier.implementation}
      partialDelivery={{
        pending: carrier.isShippingCompaniesLoading,
        blockedReason:
          carrier.isShippingCompaniesLoading || partialBlockKey === null ? null : t(partialBlockKey),
      }}
      shippingCompanyId={shippingCompanyId}
      lateness={row.lateness}
      availableFrom={row.availableFrom}
      availableTo={row.availableTo}
      rowLocked={locked}
      onOpenNotes={() => onOpenNotes(row.id)}
      onOpenActionLog={() => onOpenActionLog(row.id)}
    />
  );
}

export function ReturnedRowActions({ row }: { row: ReturnedShipment }) {
  return (
    <div className="flex flex-col gap-2">
      <ShipmentRowActions
        orderId={row.id}
        orderCode={row.code}
        customerName={row.customer.name}
        status={row.status}
        closure={row.closure}
      />
      <SendAgainAction
        orderId={row.id}
        eligible={row.sendAgainEligible}
        blockedReason={row.sendAgainBlockedReason}
        closure={row.closure}
      />
    </div>
  );
}

export interface InProcessShipmentsTableProps {
  shipments: InProcessShipment[];
  shippingCompanyId: number;
  onOpenNotes: (orderId: number) => void;
  onOpenActionLog: (orderId: number) => void;
  selection?: ShipmentSelection;
}

export function InProcessShipmentsTable({
  shipments,
  shippingCompanyId,
  onOpenNotes,
  onOpenActionLog,
  selection,
}: InProcessShipmentsTableProps) {
  const { t } = useI18n();
  const carrier = useInProcessCarrier(shippingCompanyId);
  const isBulkClosable = useIsBulkClosable();
  const selectableIds = shipments.filter(isBulkClosable).map((row) => row.id);
  const selectedCount = selection ? selectableIds.filter((id) => selection.selectedIds.has(id)).length : 0;
  const headChecked: boolean | 'indeterminate' =
    selectableIds.length > 0 && selectedCount === selectableIds.length
      ? true
      : selectedCount > 0
        ? 'indeterminate'
        : false;

  return (
    <table dir="rtl" className="w-full caption-bottom text-sm">
      <caption className="sr-only">{t('inProcess.table.captionInProcess')}</caption>
      <thead className="sticky top-0 z-10 bg-muted">
        <tr className="border-b">
          <th scope="col" className={cn(HEAD_CLASS, 'sticky start-0 z-20')}>
            <div className="flex items-center gap-2">
              {selection && (
                <Checkbox
                  aria-label={t('inProcess.select.all')}
                  className="data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary"
                  checked={headChecked}
                  disabled={selectableIds.length === 0}
                  onCheckedChange={(value) => selection.onToggleAll(selectableIds, value === true)}
                />
              )}
              {t('inProcess.table.columns.code')}
            </div>
          </th>
          <th scope="col" className={cn(HEAD_CLASS, 'min-w-40')}>
            {t('inProcess.table.columns.customer')}
          </th>
          <th scope="col" className={HEAD_CLASS}>
            {t('inProcess.table.columns.status')}
          </th>
          <th scope="col" className={HEAD_CLASS}>
            {t('inProcess.table.columns.due')}
          </th>
          <th scope="col" className={HEAD_CLASS}>
            {t('inProcess.table.columns.takenAt')}
          </th>
          <th scope="col" className={HEAD_CLASS}>
            {t('inProcess.table.columns.window')}
          </th>
          <th scope="col" className={cn(HEAD_CLASS, 'min-w-32')}>
            {t('inProcess.table.columns.address')}
          </th>
          <th scope="col" className={HEAD_CLASS}>
            {t('inProcess.table.columns.courier')}
          </th>
          <th scope="col" className={cn(HEAD_CLASS, 'text-end')}>
            {t('inProcess.table.columns.total')}
          </th>
          <Can code={PERMISSIONS.FOLLOWUP_NET_AMOUNT_READ}>
            <th scope="col" className={cn(HEAD_CLASS, 'text-end')}>
              {t('inProcess.table.columns.net')}
            </th>
          </Can>
          <th scope="col" className={cn(HEAD_CLASS, 'sticky end-0 z-20')}>
            <span className="sr-only">{t('inProcess.table.actions')}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {shipments.map((row) => {
          const chip = latenessChipOf(row.lateness, t);
          return (
            <tr key={row.id} className={ROW_CLASS}>
              <td className={cn(CELL_CLASS, STICKY_CELL_CLASS, 'start-0 border-s-[3px] whitespace-nowrap', chip.borderClassName)}>
                <div className="flex items-center gap-2">
                  {selection &&
                    (isBulkClosable(row) ? (
                      <ShipmentSelectCheckbox
                        code={row.code}
                        checked={selection.selectedIds.has(row.id)}
                        onCheckedChange={() => selection.onToggle(row.id)}
                      />
                    ) : (
                      <span aria-hidden className="size-5 shrink-0" />
                    ))}
                  <CodeCell code={row.code} />
                </div>
              </td>
              <td className={cn(CELL_CLASS, 'min-w-40')}>
                <CustomerCell name={row.customer.name} phones={row.customer.phones} />
              </td>
              <td className={CELL_CLASS}>
                <StatusCell status={row.status} closure={row.closure} />
              </td>
              <td className={CELL_CLASS}>
                <DueCell
                  model={chip}
                  dueDay={row.lateness?.dueDay ?? null}
                  override={row.lateness?.override ?? null}
                />
              </td>
              <td className={cn(CELL_CLASS, 'whitespace-nowrap')}>{formatDate(row.takenAt)}</td>
              <td className={cn(CELL_CLASS, 'whitespace-nowrap')}>
                {deliveryWindowTextOf(row.availableFrom, row.availableTo)}
              </td>
              <td className={cn(CELL_CLASS, 'min-w-32')}>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="font-medium">{row.governorate ?? '—'}</span>
                  <span className={SECONDARY_TEXT_CLASS}>{row.city ?? '—'}</span>
                </div>
              </td>
              <td className={CELL_CLASS}>
                <CourierCell name={row.courierName} phone={row.courierPhone} />
              </td>
              <td className={cn(CELL_CLASS, 'whitespace-nowrap text-end tabular-nums')}>
                {moneyTextOf(row.totalCost)}
              </td>
              <Can code={PERMISSIONS.FOLLOWUP_NET_AMOUNT_READ}>
                <td className={cn(CELL_CLASS, 'whitespace-nowrap text-end tabular-nums')}>
                  {moneyTextOf(row.netAmount)}
                </td>
              </Can>
              <td className={cn(CELL_CLASS, STICKY_CELL_CLASS, 'end-0')}>
                <InProcessRowActions
                  row={row}
                  shippingCompanyId={shippingCompanyId}
                  carrier={carrier}
                  onOpenNotes={onOpenNotes}
                  onOpenActionLog={onOpenActionLog}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export interface ReturnedShipmentsTableProps {
  shipments: ReturnedShipment[];
}

export function ReturnedShipmentsTable({ shipments }: ReturnedShipmentsTableProps) {
  const { t } = useI18n();

  return (
    <table dir="rtl" className="w-full caption-bottom text-sm">
      <caption className="sr-only">{t('inProcess.table.captionReturned')}</caption>
      <thead className="sticky top-0 z-10 bg-muted">
        <tr className="border-b">
          <th scope="col" className={cn(HEAD_CLASS, 'sticky start-0 z-20')}>
            {t('inProcess.table.columns.code')}
          </th>
          <th scope="col" className={cn(HEAD_CLASS, 'min-w-40')}>
            {t('inProcess.table.columns.customer')}
          </th>
          <th scope="col" className={HEAD_CLASS}>
            {t('inProcess.table.columns.status')}
          </th>
          <th scope="col" className={HEAD_CLASS}>
            {t('inProcess.table.columns.takenAt')}
          </th>
          <th scope="col" className={cn(HEAD_CLASS, 'min-w-32')}>
            {t('inProcess.table.columns.address')}
          </th>
          <th scope="col" className={cn(HEAD_CLASS, 'text-end')}>
            {t('inProcess.table.columns.total')}
          </th>
          <th scope="col" className={cn(HEAD_CLASS, 'sticky end-0 z-20')}>
            <span className="sr-only">{t('inProcess.table.actions')}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {shipments.map((row) => (
          <tr key={row.id} className={ROW_CLASS}>
            <td className={cn(CELL_CLASS, STICKY_CELL_CLASS, 'start-0 whitespace-nowrap')}>
              <CodeCell code={row.code} />
            </td>
            <td className={cn(CELL_CLASS, 'min-w-40')}>
              <CustomerCell name={row.customer.name} phones={row.customer.phones} />
            </td>
            <td className={CELL_CLASS}>
              <StatusCell status={row.status} closure={row.closure} />
            </td>
            <td className={cn(CELL_CLASS, 'whitespace-nowrap')}>{formatDate(row.takenAt)}</td>
            <td className={cn(CELL_CLASS, 'min-w-32')}>
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-medium">{row.governorate ?? '—'}</span>
                <span className={SECONDARY_TEXT_CLASS}>{row.city ?? '—'}</span>
              </div>
            </td>
            <td className={cn(CELL_CLASS, 'whitespace-nowrap text-end tabular-nums')}>
              {moneyTextOf(row.totalCost)}
            </td>
            <td className={cn(CELL_CLASS, STICKY_CELL_CLASS, 'end-0')}>
              <ReturnedRowActions row={row} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
