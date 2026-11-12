'use client';

import type { ReactNode } from 'react';
import { Can } from '@/components/Can';
import { useI18n } from '@/i18n/I18nProvider';
import { PrepaidBadge } from '@/components/orders/PrepaidBadge';
import { PERMISSIONS } from '@/lib/permissions';
import type { DeliveredShipment, InProcessShipment, ReturnedShipment } from '@/types/shippingProviders';
import { DateWithRelative } from '@/components/ui/date-with-relative';
import { latenessChipOf } from './LatenessChip';
import { followupTargetOf } from './followupPanels';
import {
  CodeCell,
  CourierCell,
  CustomerCell,
  DeliveredRowActions,
  DueCell,
  InProcessRowActions,
  LineCountCell,
  ReturnedRowActions,
  ShipmentSelectCheckbox,
  StatusCell,
  deliveryWindowTextOf,
  findTemplate,
  NetAmountCell,
  moneyTextOf,
  useInProcessCarrier,
  useIsBulkClosable,
  type DeliveredShipmentsTableProps,
  type InProcessShipmentsTableProps,
  type ReturnedShipmentsTableProps,
} from './ShipmentsTable';

export type InProcessShipmentCardsProps = InProcessShipmentsTableProps;

export type ReturnedShipmentCardsProps = ReturnedShipmentsTableProps;

export type DeliveredShipmentCardsProps = DeliveredShipmentsTableProps;

const CARD_CLASS = 'flex flex-col gap-3 rounded-xl border bg-card p-4';

function CardField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}

export function InProcessShipmentCards({
  shipments,
  shippingCompanyId,
  carrierSupportsUpdate,
  onOpenFollowup,
  selection,
}: InProcessShipmentCardsProps) {
  const { t } = useI18n();
  const carrier = useInProcessCarrier(shippingCompanyId);
  const isBulkClosable = useIsBulkClosable();

  return (
    <ul role="list" className="flex flex-col gap-3">
      {shipments.map((row) => (
        <li key={row.id} className={CARD_CLASS}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {selection && isBulkClosable(row) && (
                <ShipmentSelectCheckbox
                  code={row.code}
                  checked={selection.selectedIds.has(row.id)}
                  onCheckedChange={() => selection.onToggle(row.id)}
                />
              )}
              <CodeCell
                code={row.code}
                shippingCode={row.shippingCode}
                unreadNoteCount={row.unreadNoteCount}
                onOpenFollowup={(panel, opener) => onOpenFollowup(followupTargetOf(row, panel), opener)}
              />
            </div>
            <InProcessRowActions
              row={row}
              shippingCompanyId={shippingCompanyId}
              carrier={carrier}
              carrierSupportsUpdate={carrierSupportsUpdate}
              onOpenFollowup={onOpenFollowup}            />
          </div>
          <StatusCell status={row.status} closure={row.closure} />
          <DueCell
            model={latenessChipOf(row.lateness, t)}
            dueDay={row.lateness?.dueDay ?? null}
            override={row.lateness?.override ?? null}
          />
          <CustomerCell
            name={row.customer.name}
            phones={row.customer.phones}
            whatsapp={findTemplate(row.whatsappTemplates ?? [], 'SHIPMENT_CUSTOMER')}
          />
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <CardField label={t('inProcess.table.columns.takenAt')}><DateWithRelative value={row.takenAt} /></CardField>
            <CardField label={t('inProcess.table.columns.products')}>
              <LineCountCell count={row.lineCount} />
            </CardField>
            <CardField label={t('inProcess.table.columns.window')}>
              {deliveryWindowTextOf(row.availableFrom, row.availableTo)}
            </CardField>
            <CardField label={t('inProcess.table.columns.address')}>
              {row.governorate ?? '—'}
              {row.city ? ` - ${row.city}` : ''}
            </CardField>
            <CardField label={t('inProcess.table.columns.courier')}>
              <CourierCell
                name={row.courierName}
                phone={row.courierPhone}
                whatsapp={findTemplate(row.whatsappTemplates ?? [], 'SHIPMENT_COURIER')}
              />
            </CardField>
            <CardField label={t('inProcess.table.columns.total')}><span className="inline-flex items-center gap-2">{moneyTextOf(row.totalCost)}<PrepaidBadge prepaid={row.prepaid} /></span></CardField>
            <Can code={PERMISSIONS.FOLLOWUP_NET_AMOUNT_READ}>
              <CardField label={t('inProcess.table.columns.net')}>
                <NetAmountCell row={row} layout="inline" />
              </CardField>
            </Can>
          </dl>
        </li>
      ))}
    </ul>
  );
}

export function ReturnedShipmentCards({
  shipments,
  shippingCompanyId,
  onOpenFollowup,
}: ReturnedShipmentCardsProps) {
  const { t } = useI18n();
  const carrier = useInProcessCarrier(shippingCompanyId);

  return (
    <ul role="list" className="flex flex-col gap-3">
      {shipments.map((row: ReturnedShipment) => (
        <li key={row.id} className={CARD_CLASS}>
          <div className="flex items-start justify-between gap-3">
            <CodeCell
              code={row.code}
              shippingCode={row.shippingCode}
              unreadNoteCount={row.unreadNoteCount}
              onOpenFollowup={(panel, opener) => onOpenFollowup(followupTargetOf(row, panel), opener)}
            />
            <ReturnedRowActions
              row={row}
              carrierResendSupported={carrier.capabilities?.resend.supported}
              onOpenFollowup={onOpenFollowup}            />
          </div>
          <StatusCell status={row.status} closure={row.closure} />
          <CustomerCell name={row.customer.name} phones={row.customer.phones} />
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <CardField label={t('inProcess.table.columns.returnedAt')}><DateWithRelative value={row.returnedAt} /></CardField>
            <CardField label={t('inProcess.table.columns.takenAt')}><DateWithRelative value={row.takenAt} /></CardField>
            <CardField label={t('inProcess.table.columns.products')}>
              <LineCountCell count={row.lineCount} />
            </CardField>
            <CardField label={t('inProcess.table.columns.address')}>
              {row.governorate ?? '—'}
              {row.city ? ` - ${row.city}` : ''}
            </CardField>
            <CardField label={t('inProcess.table.columns.total')}><span className="inline-flex items-center gap-2">{moneyTextOf(row.totalCost)}<PrepaidBadge prepaid={row.prepaid} /></span></CardField>
          </dl>
        </li>
      ))}
    </ul>
  );
}

export function DeliveredShipmentCards({ shipments, onOpenFollowup }: DeliveredShipmentCardsProps) {
  const { t } = useI18n();

  return (
    <ul role="list" className="flex flex-col gap-3">
      {shipments.map((row: DeliveredShipment) => (
        <li key={row.id} className={CARD_CLASS}>
          <div className="flex items-start justify-between gap-3">
            <CodeCell
              code={row.code}
              shippingCode={row.shippingCode}
              unreadNoteCount={row.unreadNoteCount}
              onOpenFollowup={(panel, opener) => onOpenFollowup(followupTargetOf(row, panel), opener)}
            />
            <DeliveredRowActions row={row} onOpenFollowup={onOpenFollowup} />
          </div>
          <StatusCell status={row.status} closure={row.closure} />
          <CustomerCell name={row.customer.name} phones={row.customer.phones} />
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <CardField label={t('inProcess.table.columns.deliveredAt')}><DateWithRelative value={row.deliveredAt} /></CardField>
            <CardField label={t('inProcess.table.columns.takenAt')}><DateWithRelative value={row.takenAt} /></CardField>
            <CardField label={t('inProcess.table.columns.products')}>
              <LineCountCell count={row.lineCount} />
            </CardField>
            <CardField label={t('inProcess.table.columns.address')}>
              {row.governorate ?? '—'}
              {row.city ? ` - ${row.city}` : ''}
            </CardField>
            <CardField label={t('inProcess.table.columns.total')}><span className="inline-flex items-center gap-2">{moneyTextOf(row.totalCost)}<PrepaidBadge prepaid={row.prepaid} /></span></CardField>
          </dl>
        </li>
      ))}
    </ul>
  );
}
