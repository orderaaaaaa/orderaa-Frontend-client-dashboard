'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Can } from '@/components/Can';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import CopyButton from '@/components/ui/copy-button';
import { formatDisplayTime } from '@/components/OrderDetails/fields/TimeRangeField';
import useShippingCompanies from '@/hooks/useShippingCompanies';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { PERMISSIONS } from '@/lib/permissions';
import { getStatusBadgeConfig } from '@/lib/status-badges';
import { OrderStatus } from '@/types/orders';
import {
  IN_PROCESS_STATUSES,
  type CarrierHeader,
  type InProcessShipment,
  type LatenessFlag,
  type LatenessInfo,
  type ReturnedShipment,
  type ShipmentRowBase,
} from '@/types/shippingProviders';
import { getTimeAgoCompact } from '@/utils/timeAgo';
import { DeliveryWindowModal } from './DeliveryWindowModal';
import { formatDate, formatNumber } from './formatNumber';
import { LateMarkModal } from './LateMarkModal';
import { SendAgainAction } from './SendAgainAction';
import { ShipmentRowActions } from './ShipmentRowActions';

const FLAG_DOT_CLASSES: Record<LatenessFlag | 'NONE', string> = {
  RED: 'bg-red-500',
  YELLOW: 'bg-amber-400',
  GREEN: 'bg-green-500',
  NONE: 'bg-gray-300',
};

const OVERRIDE_LABELS = {
  LATE: 'متأخر يدوياً',
  ON_TIME: 'في الموعد يدوياً',
} as const;

const HEAD_CLASS = 'text-right py-2 px-3 font-semibold text-gray-700 whitespace-nowrap';
const CELL_CLASS = 'py-2 px-3 text-gray-600 align-top';

const isLockedRow = (row: ShipmentRowBase): boolean =>
  row.closure?.kind === 'REFUSE' ||
  row.closure?.kind === 'CANCEL' ||
  !(IN_PROCESS_STATUSES as readonly OrderStatus[]).includes(row.status);

const PARTIAL_DELIVERY_BLOCK_REASONS = {
  carrier: 'التسليم الجزئي متاح لشركة تربو فقط',
  locked: 'الطلب مغلق في المتابعة',
  status: 'التسليم الجزئي متاح للطلبات مع المندوب فقط',
} as const;

const partialDeliveryBlockReasonOf = ({
  isTurboCarrier,
  locked,
  status,
}: {
  isTurboCarrier: boolean;
  locked: boolean;
  status: OrderStatus;
}): string | null => {
  if (!isTurboCarrier) return PARTIAL_DELIVERY_BLOCK_REASONS.carrier;
  if (locked) return PARTIAL_DELIVERY_BLOCK_REASONS.locked;
  if (status !== OrderStatus.WITH_DRIVER) return PARTIAL_DELIVERY_BLOCK_REASONS.status;
  return null;
};

const renderTotal = (totalCost: number | null) =>
  totalCost === null ? '—' : `${formatNumber(totalCost, 2)} جنيه`;

function CodeCell({ code }: { code: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="font-mono font-medium text-gray-900">{code}</span>
      <CopyButton value={code} successMessage="تم نسخ الكود" />
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const { getStatusLabel } = useStatusLabel();
  const { classes, Icon } = getStatusBadgeConfig(status);

  return (
    <span
      className={clsx(
        'flex items-center gap-2 px-4 py-2 rounded-full font-medium w-fit whitespace-nowrap',
        classes,
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="text-xs font-medium">{getStatusLabel(status)}</span>
    </span>
  );
}

function PhoneCell({ phones }: { phones: string[] }) {
  const [isListOpen, setIsListOpen] = useState(false);
  const [first] = phones;

  if (first === undefined) return <span>—</span>;

  return (
    <div className="flex items-center gap-1">
      <span dir="ltr" className="font-mono whitespace-nowrap">
        {first}
      </span>
      <CopyButton value={first} successMessage="تم نسخ الرقم" />
      {phones.length > 1 && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 text-xs"
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
                  <CopyButton value={phone} successMessage="تم نسخ الرقم" />
                </li>
              ))}
            </ul>
          </BaseModal>
        </>
      )}
    </div>
  );
}

function LatenessCell({
  shippingCompanyId,
  orderId,
  lateness,
  locked,
}: {
  shippingCompanyId: number;
  orderId: number;
  lateness: LatenessInfo | null;
  locked: boolean;
}) {
  const [isLateMarkOpen, setIsLateMarkOpen] = useState(false);
  const flag = lateness?.flag ?? null;
  const dueDay = lateness?.dueDay ?? null;
  const daysLate = lateness?.daysLate ?? null;
  const override = lateness?.override ?? null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span
          title={flag ?? 'بدون موعد محسوب'}
          className={clsx('w-2.5 h-2.5 rounded-full shrink-0', FLAG_DOT_CLASSES[flag ?? 'NONE'])}
        />
        <span className="text-gray-900 whitespace-nowrap">{dueDay ? formatDate(dueDay) : '—'}</span>
      </div>
      {dueDay && <span className="text-xs text-gray-500 whitespace-nowrap">{getTimeAgoCompact(dueDay)}</span>}
      {flag !== null && daysLate !== null && daysLate > 0 && (
        <span className="text-xs font-semibold text-red-600 whitespace-nowrap">تأخير {daysLate} يوم</span>
      )}
      {override !== null && (
        <span className="text-xs text-primary whitespace-nowrap">{OVERRIDE_LABELS[override]}</span>
      )}
      <Can code={PERMISSIONS.FOLLOWUP_CARRIERS_LATE_MANAGE}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-xs self-start"
          disabled={locked}
          onClick={() => setIsLateMarkOpen(true)}
        >
          حالة التأخير
        </Button>
      </Can>
      {isLateMarkOpen && (
        <LateMarkModal
          shippingCompanyId={shippingCompanyId}
          orderId={orderId}
          lateness={lateness}
          onClose={() => setIsLateMarkOpen(false)}
        />
      )}
    </div>
  );
}

function DeliveryWindowCell({
  shippingCompanyId,
  orderId,
  availableFrom,
  availableTo,
  locked,
}: {
  shippingCompanyId: number;
  orderId: number;
  availableFrom: string | null;
  availableTo: string | null;
  locked: boolean;
}) {
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const label =
    availableFrom && availableTo
      ? `${formatDisplayTime(availableFrom)} - ${formatDisplayTime(availableTo)}`
      : '-';

  return (
    <div className="flex items-center gap-1">
      <span className="whitespace-nowrap">{label}</span>
      <Can code={PERMISSIONS.FOLLOWUP_CARRIERS_DELIVERY_MANAGE}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-xs"
          disabled={locked}
          onClick={() => setIsWindowOpen(true)}
        >
          تعديل
        </Button>
      </Can>
      {isWindowOpen && (
        <DeliveryWindowModal
          shippingCompanyId={shippingCompanyId}
          orderId={orderId}
          availableFrom={availableFrom}
          availableTo={availableTo}
          onClose={() => setIsWindowOpen(false)}
        />
      )}
    </div>
  );
}

function CarrierCell({ carrier }: { carrier: CarrierHeader }) {
  return (
    <div className="flex flex-col">
      <span className="text-gray-900 whitespace-nowrap">{carrier.name}</span>
      {carrier.phone && (
        <span dir="ltr" className="text-xs text-gray-500 font-mono whitespace-nowrap">
          {carrier.phone}
        </span>
      )}
    </div>
  );
}

interface InProcessShipmentsTableProps {
  shipments: InProcessShipment[];
  carrier: CarrierHeader;
  shippingCompanyId: number;
}

export function InProcessShipmentsTable({
  shipments,
  carrier,
  shippingCompanyId,
}: InProcessShipmentsTableProps) {
  const { shippingCompanies } = useShippingCompanies();
  const isTurboCarrier =
    shippingCompanies.find((company) => company.id === shippingCompanyId)?.implementation === 'TURBO';

  return (
    <table className="w-full text-sm whitespace-nowrap" dir="rtl">
      <thead>
        <tr className="border-b border-gray-200 bg-gray-50">
          <th className={HEAD_CLASS}>الكود</th>
          <th className={HEAD_CLASS}>العميل</th>
          <th className={HEAD_CLASS}>الهاتف</th>
          <th className={HEAD_CLASS}>الحالة</th>
          <th className={HEAD_CLASS}>تاريخ الاستلام</th>
          <th className={HEAD_CLASS}>الموعد</th>
          <th className={HEAD_CLASS}>وقت التوصيل</th>
          <th className={HEAD_CLASS}>المحافظة</th>
          <th className={HEAD_CLASS}>المنطقة</th>
          <th className={HEAD_CLASS}>الإجمالي</th>
          <Can code={PERMISSIONS.FOLLOWUP_NET_AMOUNT_READ}>
            <th className={HEAD_CLASS}>الصافي</th>
          </Can>
          <th className={HEAD_CLASS}>شركة الشحن</th>
          <th className={HEAD_CLASS}>الإغلاق</th>
        </tr>
      </thead>
      <tbody>
        {shipments.map((row) => {
          const locked = isLockedRow(row);
          return (
            <tr key={row.id} className="border-b border-gray-100">
              <td className={clsx(CELL_CLASS, 'font-medium text-gray-900')}>
                <CodeCell code={row.code} />
              </td>
              <td className={CELL_CLASS}>{row.customer.name ?? '—'}</td>
              <td className={CELL_CLASS}>
                <PhoneCell phones={row.customer.phones} />
              </td>
              <td className={CELL_CLASS}>
                <StatusBadge status={row.status} />
              </td>
              <td className={CELL_CLASS}>{formatDate(row.takenAt)}</td>
              <td className={CELL_CLASS}>
                <LatenessCell
                  shippingCompanyId={shippingCompanyId}
                  orderId={row.id}
                  lateness={row.lateness}
                  locked={locked}
                />
              </td>
              <td className={CELL_CLASS}>
                <DeliveryWindowCell
                  shippingCompanyId={shippingCompanyId}
                  orderId={row.id}
                  availableFrom={row.availableFrom}
                  availableTo={row.availableTo}
                  locked={locked}
                />
              </td>
              <td className={CELL_CLASS}>{row.governorate ?? '—'}</td>
              <td className={CELL_CLASS}>{row.city ?? '—'}</td>
              <td className={CELL_CLASS}>{renderTotal(row.totalCost)}</td>
              <Can code={PERMISSIONS.FOLLOWUP_NET_AMOUNT_READ}>
                <td className={CELL_CLASS}>
                  {row.netAmount === undefined ? '—' : `${formatNumber(row.netAmount, 2)} جنيه`}
                </td>
              </Can>
              <td className={CELL_CLASS}>
                <CarrierCell carrier={carrier} />
              </td>
              <td className={CELL_CLASS}>
                <ShipmentRowActions
                  orderId={row.id}
                  closure={row.closure}
                  partialDelivery={{
                    blockedReason: partialDeliveryBlockReasonOf({
                      isTurboCarrier,
                      locked,
                      status: row.status,
                    }),
                  }}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

interface ReturnedShipmentsTableProps {
  shipments: ReturnedShipment[];
  carrier: CarrierHeader;
}

export function ReturnedShipmentsTable({ shipments, carrier }: ReturnedShipmentsTableProps) {
  return (
    <table className="w-full text-sm whitespace-nowrap" dir="rtl">
      <thead>
        <tr className="border-b border-gray-200 bg-gray-50">
          <th className={HEAD_CLASS}>الكود</th>
          <th className={HEAD_CLASS}>العميل</th>
          <th className={HEAD_CLASS}>الهاتف</th>
          <th className={HEAD_CLASS}>الحالة</th>
          <th className={HEAD_CLASS}>تاريخ الاستلام</th>
          <th className={HEAD_CLASS}>المحافظة</th>
          <th className={HEAD_CLASS}>المنطقة</th>
          <th className={HEAD_CLASS}>الإجمالي</th>
          <th className={HEAD_CLASS}>شركة الشحن</th>
          <th className={HEAD_CLASS}>الإغلاق</th>
        </tr>
      </thead>
      <tbody>
        {shipments.map((row) => (
          <tr key={row.id} className="border-b border-gray-100">
            <td className={clsx(CELL_CLASS, 'font-medium text-gray-900')}>
              <CodeCell code={row.code} />
            </td>
            <td className={CELL_CLASS}>{row.customer.name ?? '—'}</td>
            <td className={CELL_CLASS}>
              <PhoneCell phones={row.customer.phones} />
            </td>
            <td className={CELL_CLASS}>
              <StatusBadge status={row.status} />
            </td>
            <td className={CELL_CLASS}>{formatDate(row.takenAt)}</td>
            <td className={CELL_CLASS}>{row.governorate ?? '—'}</td>
            <td className={CELL_CLASS}>{row.city ?? '—'}</td>
            <td className={CELL_CLASS}>{renderTotal(row.totalCost)}</td>
            <td className={CELL_CLASS}>
              <CarrierCell carrier={carrier} />
            </td>
            <td className={CELL_CLASS}>
              <div className="flex flex-col gap-2">
                <ShipmentRowActions orderId={row.id} closure={row.closure} />
                <SendAgainAction
                  orderId={row.id}
                  eligible={row.sendAgainEligible}
                  blockedReason={row.sendAgainBlockedReason}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
