'use client';

import { useState } from 'react';
import { LiaWhatsapp } from 'react-icons/lia';
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
import type { ShippingImplementation } from '@/types/shippingCompanies';
import {
  IN_PROCESS_STATUSES,
  type InProcessShipment,
  type LatenessOverride,
  type ReturnedShipment,
  type ShipmentRowBase,
  type ShipmentWhatsAppTemplate,
  type ShipmentWhatsAppTemplateType,
} from '@/types/shippingProviders';
import { partialDeliveryBlockReasonOf } from '@/utils/partialDelivery/partialDeliveryGate';
import { getTimeAgoCompact } from '@/utils/timeAgo';
import { formatDate, formatNumber } from './formatNumber';
import { LatenessChip, latenessChipOf, type LatenessChipModel } from './LatenessChip';
import { CLOSURE_KIND_LABEL_KEYS, ShipmentRowActions, closureReasonOf } from './ShipmentRowActions';
import { ShipmentStatusBadge } from './ShipmentStatusBadge';

const OVERRIDE_LABEL_KEYS: Record<LatenessOverride, TranslationKey> = {
  LATE: 'inProcess.lateness.manualLate',
  ON_TIME: 'inProcess.lateness.manualOnTime',
};

const HEAD_CLASS = 'whitespace-nowrap bg-muted px-2 py-2.5 text-start font-medium text-foreground';
const CELL_CLASS = 'px-2 py-2.5 align-top text-sm text-foreground';
const SECONDARY_TEXT_CLASS = 'text-xs text-muted-foreground';
const STICKY_CELL_CLASS = 'sticky z-(--z-inpage-pinned) bg-card group-hover:bg-muted';
const PINNED_END_CUE_CLASS =
  'before:pointer-events-none before:absolute before:inset-y-0 before:-start-3 before:hidden before:w-3 before:content-[""] before:[background-image:linear-gradient(to_right,color-mix(in_oklch,var(--foreground)_28%,transparent),transparent)] dark:before:[background-image:linear-gradient(to_right,color-mix(in_oklch,var(--foreground)_14%,transparent),transparent)] group-data-[overflow-end=true]/results:before:block';
const ROW_CLASS = 'group border-b transition-colors duration-150 hover:bg-surface-hover/40';

export const isLockedRow = (row: ShipmentRowBase): boolean =>
  row.closure?.kind === 'REFUSE' ||
  row.closure?.kind === 'CANCEL' ||
  !(IN_PROCESS_STATUSES as readonly OrderStatus[]).includes(row.status);

export const moneyTextOf = (value: number | string | null | undefined): string =>
  value === null || value === undefined ? '—' : `${formatNumber(value, 2)} جنيه`;

export const deliveryWindowTextOf = (from: string | null, to: string | null): string =>
  from && to ? `${formatDisplayTime(from)} - ${formatDisplayTime(to)}` : '—';

export function useInProcessCarrier(shippingCompanyId: number) {
  const { shippingCompanies, isLoading } = useShippingCompanies();
  const company = shippingCompanies.find((candidate) => candidate.id === shippingCompanyId);
  const implementation: ShippingImplementation | undefined = company?.implementation;
  return {
    implementation,
    isShippingCompaniesLoading: isLoading,
    capabilities: company?.capabilities,
  };
}

export type InProcessCarrier = ReturnType<typeof useInProcessCarrier>;

export function useIsBulkClosable(): (row: ShipmentRowBase) => boolean {
  const { hasPermission } = usePermissionCheck();
  const canCloseToday = hasPermission(PERMISSIONS.FOLLOWUP_CARRIERS_CLOSE_MANAGE);
  return (row) => row.closure === null && canCloseToday;
}

export function CodeCell({ code, shippingCode }: { code: string; shippingCode: string | null }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-start gap-1">
      <CopyableCode value={code} label="نسخ كود الطلب">
        <span className="font-mono font-semibold text-foreground">{code}</span>
      </CopyableCode>
      <CopyableCode value={shippingCode} label={t('inProcess.table.copyShippingCode')}>
        <span className={cn('font-mono', SECONDARY_TEXT_CLASS)}>{shippingCode ?? '—'}</span>
      </CopyableCode>
    </div>
  );
}

export function findTemplate(
  templates: readonly ShipmentWhatsAppTemplate[],
  type: ShipmentWhatsAppTemplateType,
): ShipmentWhatsAppTemplate | undefined {
  return templates.find((template) => template.type === type);
}

export function WhatsAppLink({ template }: { template: ShipmentWhatsAppTemplate | undefined }) {
  if (template === undefined) return null;
  return (
    <Button asChild variant="ghost" size="icon-xs" className={'relative z-(--z-inpage-control) max-sm:before:absolute max-sm:before:-inset-2 max-sm:before:content-[""]'}>
      <a href={template.url} target="_blank" rel="noopener noreferrer" aria-label={template.label}>
        <LiaWhatsapp className="size-4" aria-hidden />
      </a>
    </Button>
  );
}

export function PhoneCell({ phones }: { phones: string[] }) {
  const { t } = useI18n();
  const [isListOpen, setIsListOpen] = useState(false);
  const [first] = phones;

  if (first === undefined) return <span>—</span>;

  return (
    <div className="flex items-center gap-1 whitespace-nowrap max-sm:gap-3">
      <span dir="ltr" className="shrink-0 font-mono whitespace-nowrap">
        {first}
      </span>
      <CopyButton value={first} label={t('inProcess.table.copyPhone')} successMessage="تم نسخ الرقم" />
      {phones.length > 1 && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className={'relative z-(--z-raised) max-sm:before:absolute max-sm:before:-inset-2 max-sm:before:content-[""]'}
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

export function CustomerCell({
  name,
  phones,
  whatsapp,
}: {
  name: string | null;
  phones: string[];
  whatsapp?: ShipmentWhatsAppTemplate;
}) {
  return (
    <div className="flex min-w-max flex-col items-start gap-1">
      <span className="block max-w-32 truncate font-medium" title={name ?? undefined}>{name ?? '—'}</span>
      <div className="flex items-center gap-1.5">
        <WhatsAppLink template={whatsapp} />
        <PhoneCell phones={phones} />
      </div>
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
              <Badge variant="outline" className="text-primary-text">
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

export function CourierCell({
  name,
  phone,
  whatsapp,
}: {
  name: string | null;
  phone: string | null;
  whatsapp?: ShipmentWhatsAppTemplate;
}) {
  if (name === null && phone === null) return <span>—</span>;

  return <CustomerCell name={name} phones={phone ? [phone] : []} whatsapp={whatsapp} />;
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
  carrierSupportsUpdate,
  onOpenNotes,
  onOpenActionLog,
}: {
  row: InProcessShipment;
  shippingCompanyId: number;
  carrier: InProcessCarrier;
  carrierSupportsUpdate?: boolean;
  onOpenNotes: (orderId: number) => void;
  onOpenActionLog: (orderId: number, orderCode: string) => void;
}) {
  const { t } = useI18n();
  const locked = isLockedRow(row);
  const partialBlockKey = partialDeliveryBlockReasonOf({
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
      exchangeCarrier={{ pending: carrier.isShippingCompaniesLoading, supported: carrier.capabilities?.exchangeShipment.supported }}
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
      editRow={row}
      carrierSupportsUpdate={carrierSupportsUpdate}
      onOpenNotes={() => onOpenNotes(row.id)}
      onOpenActionLog={() => onOpenActionLog(row.id, row.code)}
    />
  );
}

export function ReturnedRowActions({
  row,
  carrierResendSupported,
  onOpenNotes,
  onOpenActionLog,
}: {
  row: ReturnedShipment;
  carrierResendSupported?: boolean;
  onOpenNotes: (orderId: number) => void;
  onOpenActionLog: (orderId: number, orderCode: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <ShipmentRowActions
        orderId={row.id}
        orderCode={row.code}
        customerName={row.customer.name}
        status={row.status}
        closure={row.closure}
        sendAgain={{ eligible: row.sendAgainEligible, blockedReason: row.sendAgainBlockedReason }}
        carrierResendSupported={carrierResendSupported}
        onOpenNotes={() => onOpenNotes(row.id)}
        onOpenActionLog={() => onOpenActionLog(row.id, row.code)}
      />
    </div>
  );
}

export interface InProcessShipmentsTableProps {
  shipments: InProcessShipment[];
  shippingCompanyId: number;
  carrierSupportsUpdate?: boolean;
  onOpenNotes: (orderId: number) => void;
  onOpenActionLog: (orderId: number, orderCode: string) => void;
  selection?: ShipmentSelection;
}

export function InProcessShipmentsTable({
  shipments,
  shippingCompanyId,
  carrierSupportsUpdate,
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
      <thead className="sticky top-0 z-(--z-inpage-sticky) bg-muted">
        <tr className="border-b">
          <th scope="col" className={cn(HEAD_CLASS, 'sticky start-0 z-(--z-inpage-sticky-corner)')}>
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
          <th scope="col" className={HEAD_CLASS}>
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
          <th scope="col" className={cn(HEAD_CLASS, 'max-w-40')}>
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
          <th scope="col" className={cn(HEAD_CLASS, 'sticky end-0 z-(--z-inpage-sticky)', PINNED_END_CUE_CLASS)}>
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
                  <CodeCell code={row.code} shippingCode={row.shippingCode} />
                </div>
              </td>
              <td className={CELL_CLASS}>
                <CustomerCell
                  name={row.customer.name}
                  phones={row.customer.phones}
                  whatsapp={findTemplate(row.whatsappTemplates ?? [], 'SHIPMENT_CUSTOMER')}
                />
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
              <td className={cn(CELL_CLASS, 'max-w-40 whitespace-normal')}>
                {deliveryWindowTextOf(row.availableFrom, row.availableTo)}
              </td>
              <td className={cn(CELL_CLASS, 'max-w-40')}>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="font-medium">{row.governorate ?? '—'}</span>
                  <span className={SECONDARY_TEXT_CLASS}>{row.city ?? '—'}</span>
                </div>
              </td>
              <td className={CELL_CLASS}>
                <CourierCell
                  name={row.courierName}
                  phone={row.courierPhone}
                  whatsapp={findTemplate(row.whatsappTemplates ?? [], 'SHIPMENT_COURIER')}
                />
              </td>
              <td className={cn(CELL_CLASS, 'whitespace-nowrap text-end tabular-nums')}>
                {moneyTextOf(row.totalCost)}
              </td>
              <Can code={PERMISSIONS.FOLLOWUP_NET_AMOUNT_READ}>
                <td className={cn(CELL_CLASS, 'whitespace-nowrap text-end tabular-nums')}>
                  {moneyTextOf(row.netAmount)}
                </td>
              </Can>
              <td className={cn(CELL_CLASS, STICKY_CELL_CLASS, 'end-0', PINNED_END_CUE_CLASS)}>
                <InProcessRowActions
                  row={row}
                  shippingCompanyId={shippingCompanyId}
                  carrier={carrier}
                  carrierSupportsUpdate={carrierSupportsUpdate}
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
  shippingCompanyId: number;
  onOpenNotes: (orderId: number) => void;
  onOpenActionLog: (orderId: number, orderCode: string) => void;
}

export function ReturnedShipmentsTable({
  shipments,
  shippingCompanyId,
  onOpenNotes,
  onOpenActionLog,
}: ReturnedShipmentsTableProps) {
  const { t } = useI18n();
  const carrier = useInProcessCarrier(shippingCompanyId);

  return (
    <table dir="rtl" className="w-full caption-bottom text-sm">
      <caption className="sr-only">{t('inProcess.table.captionReturned')}</caption>
      <thead className="sticky top-0 z-(--z-inpage-sticky) bg-muted">
        <tr className="border-b">
          <th scope="col" className={cn(HEAD_CLASS, 'sticky start-0 z-(--z-inpage-sticky-corner)')}>
            {t('inProcess.table.columns.code')}
          </th>
          <th scope="col" className={HEAD_CLASS}>
            {t('inProcess.table.columns.customer')}
          </th>
          <th scope="col" className={HEAD_CLASS}>
            {t('inProcess.table.columns.status')}
          </th>
          <th scope="col" className={HEAD_CLASS}>
            {t('inProcess.table.columns.takenAt')}
          </th>
          <th scope="col" className={cn(HEAD_CLASS, 'max-w-40')}>
            {t('inProcess.table.columns.address')}
          </th>
          <th scope="col" className={cn(HEAD_CLASS, 'text-end')}>
            {t('inProcess.table.columns.total')}
          </th>
          <th scope="col" className={cn(HEAD_CLASS, 'sticky end-0 z-(--z-inpage-sticky)', PINNED_END_CUE_CLASS)}>
            <span className="sr-only">{t('inProcess.table.actions')}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {shipments.map((row) => (
          <tr key={row.id} className={ROW_CLASS}>
            <td className={cn(CELL_CLASS, STICKY_CELL_CLASS, 'start-0 whitespace-nowrap')}>
              <CodeCell code={row.code} shippingCode={row.shippingCode} />
            </td>
            <td className={CELL_CLASS}>
              <CustomerCell name={row.customer.name} phones={row.customer.phones} />
            </td>
            <td className={CELL_CLASS}>
              <StatusCell status={row.status} closure={row.closure} />
            </td>
            <td className={cn(CELL_CLASS, 'whitespace-nowrap')}>{formatDate(row.takenAt)}</td>
            <td className={cn(CELL_CLASS, 'max-w-40')}>
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-medium">{row.governorate ?? '—'}</span>
                <span className={SECONDARY_TEXT_CLASS}>{row.city ?? '—'}</span>
              </div>
            </td>
            <td className={cn(CELL_CLASS, 'whitespace-nowrap text-end tabular-nums')}>
              {moneyTextOf(row.totalCost)}
            </td>
            <td className={cn(CELL_CLASS, STICKY_CELL_CLASS, 'end-0', PINNED_END_CUE_CLASS)}>
              <ReturnedRowActions
                row={row}
                carrierResendSupported={carrier.capabilities?.resend.supported}
                onOpenNotes={onOpenNotes}
                onOpenActionLog={onOpenActionLog}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
