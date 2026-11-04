'use client';

import type { ReactNode } from 'react';
import { Can } from '@/components/Can';
import { useI18n } from '@/i18n/I18nProvider';
import { PERMISSIONS } from '@/lib/permissions';
import type { InProcessShipment, ReturnedShipment } from '@/types/shippingProviders';
import { formatDate } from './formatNumber';
import { latenessChipOf } from './LatenessChip';
import {
  CodeCell,
  CourierCell,
  CustomerCell,
  DueCell,
  InProcessRowActions,
  ReturnedRowActions,
  ShipmentSelectCheckbox,
  StatusCell,
  deliveryWindowTextOf,
  findTemplate,
  moneyTextOf,
  useInProcessCarrier,
  useIsBulkClosable,
  type InProcessShipmentsTableProps,
  type ReturnedShipmentsTableProps,
} from './ShipmentsTable';

export type InProcessShipmentCardsProps = InProcessShipmentsTableProps;

export type ReturnedShipmentCardsProps = ReturnedShipmentsTableProps;

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
  onOpenNotes,
  onOpenActionLog,
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
              <CodeCell code={row.code} shippingCode={row.shippingCode} />
            </div>
            <InProcessRowActions
              row={row}
              shippingCompanyId={shippingCompanyId}
              carrier={carrier}
              carrierSupportsUpdate={carrierSupportsUpdate}
              onOpenNotes={onOpenNotes}
              onOpenActionLog={onOpenActionLog}
            />
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
            <CardField label={t('inProcess.table.columns.takenAt')}>{formatDate(row.takenAt)}</CardField>
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
            <CardField label={t('inProcess.table.columns.total')}>{moneyTextOf(row.totalCost)}</CardField>
            <Can code={PERMISSIONS.FOLLOWUP_NET_AMOUNT_READ}>
              <CardField label={t('inProcess.table.columns.net')}>{moneyTextOf(row.netAmount)}</CardField>
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
  onOpenNotes,
  onOpenActionLog,
}: ReturnedShipmentCardsProps) {
  const { t } = useI18n();
  const carrier = useInProcessCarrier(shippingCompanyId);

  return (
    <ul role="list" className="flex flex-col gap-3">
      {shipments.map((row: ReturnedShipment) => (
        <li key={row.id} className={CARD_CLASS}>
          <div className="flex items-start justify-between gap-3">
            <CodeCell code={row.code} shippingCode={row.shippingCode} />
            <ReturnedRowActions
              row={row}
              carrierResendSupported={carrier.capabilities?.resend.supported}
              onOpenNotes={onOpenNotes}
              onOpenActionLog={onOpenActionLog}
            />
          </div>
          <StatusCell status={row.status} closure={row.closure} />
          <CustomerCell name={row.customer.name} phones={row.customer.phones} />
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <CardField label={t('inProcess.table.columns.takenAt')}>{formatDate(row.takenAt)}</CardField>
            <CardField label={t('inProcess.table.columns.address')}>
              {row.governorate ?? '—'}
              {row.city ? ` - ${row.city}` : ''}
            </CardField>
            <CardField label={t('inProcess.table.columns.total')}>{moneyTextOf(row.totalCost)}</CardField>
          </dl>
        </li>
      ))}
    </ul>
  );
}
