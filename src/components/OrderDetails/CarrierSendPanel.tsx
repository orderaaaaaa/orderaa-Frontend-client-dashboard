'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import {
  CARRIER_SEND_OPEN_STATES,
  CARRIER_SEND_OPERATION_LABELS,
  CARRIER_SEND_STATE_LABELS,
  CLOSE_KIND_LABELS,
  CLOSE_OUTCOME_LABELS,
} from '@/constants/carrierSends';
import {
  useCarrierSendsForOrder,
  useCloseCarrierSend,
  useDispatchCarrierSend,
  useOldShipmentCancelledByHand,
  useSendAgainCarrierSend,
  type CloseCarrierSendBody,
} from '@/services/carrierSends';
import {
  useMarkSystemFailureSeen,
  useOrderSystemFailures,
} from '@/services/orderSystemFailures';
import type {
  CarrierSendCloseChoice,
  CarrierSendState,
  CarrierSendView,
} from '@/types/carrierSends';
import type { OrderSystemFailure } from '@/types/orderSystemFailures';
import type { Order } from '@/types/orders';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/format';
import { CARRIER_SEND_NOT_SENT_WARNING } from '@/utils/manualOrder/carrierSend';
import { OrderSystemFailureItem } from './SystemFailures/OrderSystemFailureItem';
import { narrowFailureDetails } from './SystemFailures/details/guards';

const HELD_LINE =
  'تم الحفظ ولم يُرسل. رفضت شركة الشحن التعديل السابق. تحقق من شركة الشحن لهذا الطلب، ثم أكد الإرسال.';
const SHIPMENT_CHECK_LABEL = 'تحققت من شركة الشحن، أرسل';
const RESEND_AFTER_CHECK_LABEL = 'تحقق من شركة الشحن ثم أعد الإرسال';
const STALE_LINE = 'هذا الإرسال تجاوز موعده المعتاد، تحقق من شركة الشحن قبل إغلاقه.';
const SHIPMENT_ID_MAX_LENGTH = 64;
const NOTE_MAX_LENGTH = 255;

type OldShipmentRow = { shippingId: string; oldCompanyId: number };

const markerRowsOf = (failures: OrderSystemFailure[], markerId: number) =>
  failures.filter((failure) => {
    const narrowed = narrowFailureDetails(failure);
    return (
      narrowed !== null &&
      (narrowed.code === 'SHIPMENT_UPDATE_NOT_SENT' || narrowed.code === 'SHIPMENT_OUTCOME_UNKNOWN') &&
      narrowed.details.markerId === markerId
    );
  });

const oldShipmentRowsOf = (failures: OrderSystemFailure[]) => {
  const rows = new Map<string, OldShipmentRow>();
  for (const failure of failures) {
    const narrowed = narrowFailureDetails(failure);
    if (!narrowed) continue;
    if (
      narrowed.code !== 'OLD_SHIPMENT_STILL_LIVE' &&
      narrowed.code !== 'CARRIER_MESSAGE_AFTER_SWITCH'
    ) {
      continue;
    }
    const { shippingId, oldCompanyId } = narrowed.details;
    rows.set(`${oldCompanyId}:${shippingId}`, { shippingId, oldCompanyId });
  }
  return [...rows.values()];
};

const notifySettlement = (state: CarrierSendState, successText: string) => {
  if (state === 'SENT') {
    toast.success(successText);
    return;
  }
  toast.warning(CARRIER_SEND_NOT_SENT_WARNING);
};

function CloseCarrierSendForm({
  pending,
  onSubmit,
}: {
  pending: boolean;
  onSubmit: (body: CloseCarrierSendBody) => void;
}) {
  const [outcome, setOutcome] = useState<CarrierSendCloseChoice>('SHIPMENT_RECORDED');
  const [shipmentId, setShipmentId] = useState('');
  const [note, setNote] = useState('');

  const trimmedShipmentId = shipmentId.trim();
  const trimmedNote = note.trim();
  const canSubmit =
    outcome === 'SHIPMENT_RECORDED'
      ? trimmedShipmentId.length >= 1 && trimmedShipmentId.length <= SHIPMENT_ID_MAX_LENGTH
      : trimmedNote.length >= 1 && trimmedNote.length <= NOTE_MAX_LENGTH;

  const handleSubmit = () => {
    if (!canSubmit || pending) return;
    onSubmit(
      outcome === 'SHIPMENT_RECORDED'
        ? { outcome, shipmentId: trimmedShipmentId }
        : { outcome, note: trimmedNote },
    );
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <p className="text-sm font-semibold text-gray-800">إغلاق الإرسال</p>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CLOSE_OUTCOME_LABELS) as CarrierSendCloseChoice[]).map((choice) => (
          <Button
            key={choice}
            type="button"
            size="sm"
            variant={outcome === choice ? 'default' : 'outline'}
            onClick={() => setOutcome(choice)}
            disabled={pending}
          >
            {CLOSE_OUTCOME_LABELS[choice]}
          </Button>
        ))}
      </div>
      {outcome === 'SHIPMENT_RECORDED' ? (
        <Input
          type="text"
          value={shipmentId}
          onChange={(e) => setShipmentId(e.target.value)}
          placeholder="رقم الشحنة لدى شركة الشحن"
          maxLength={SHIPMENT_ID_MAX_LENGTH}
          disabled={pending}
          inputClassName="bg-white"
        />
      ) : (
        <Textarea
          name="carrierSendNote"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="اكتب ما تأكدت منه لدى شركة الشحن"
          maxLength={NOTE_MAX_LENGTH}
          disabled={pending}
        />
      )}
      <div className="flex justify-end">
        <Button type="button" size="sm" onClick={handleSubmit} disabled={!canSubmit || pending}>
          إغلاق الإرسال
        </Button>
      </div>
    </div>
  );
}

function CarrierSendMarkerBlock({
  order,
  marker,
  rows,
}: {
  order: Order;
  marker: CarrierSendView;
  rows: OrderSystemFailure[];
}) {
  const orderId = order.id;
  const canClose = useHasPermission(PERMISSION_CODES.ORDERS_CARRIER_SENDS_CLOSE);
  const canUpdate = useHasPermission(PERMISSION_CODES.ORDERS_UPDATE);
  const dispatchMutation = useDispatchCarrierSend();
  const sendAgainMutation = useSendAgainCarrierSend();
  const closeMutation = useCloseCarrierSend();
  const markSeenMutation = useMarkSystemFailureSeen(orderId);

  const isOpen = CARRIER_SEND_OPEN_STATES.includes(marker.state);
  const isRejectedOrClosed = marker.state === 'REJECTED' || marker.state === 'CLOSED_NONE';
  const busy = dispatchMutation.isPending || sendAgainMutation.isPending || closeMutation.isPending;

  const handleDispatch = () =>
    dispatchMutation
      .mutateAsync({ orderId, markerId: marker.id })
      .then(({ settlement }) => notifySettlement(settlement.state, 'تم إرسال الطلب لشركة الشحن'))
      .catch((err: unknown) =>
        toast.error(getApiErrorMessage(err, 'تعذر إرسال الطلب لشركة الشحن')),
      );

  const handleSendAgain = () =>
    sendAgainMutation
      .mutateAsync({ orderId, markerId: marker.id })
      .then(({ settlement }) => notifySettlement(settlement.state, 'تمت إعادة الإرسال'))
      .catch((err: unknown) =>
        toast.error(getApiErrorMessage(err, 'تعذر إعادة الإرسال لشركة الشحن')),
      );

  const handleClose = (body: CloseCarrierSendBody) =>
    closeMutation
      .mutateAsync({ orderId, markerId: marker.id, body })
      .then(() => toast.success('تم إغلاق الإرسال'))
      .catch((err: unknown) => toast.error(getApiErrorMessage(err, 'تعذر إغلاق الإرسال')));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {isOpen && <Badge variant="destructive">مفتوح</Badge>}
      </div>

      <div className="flex flex-col gap-1 text-sm text-gray-800">
        <p>
          <span className="font-semibold">{CARRIER_SEND_OPERATION_LABELS[marker.operation]}</span>
          {' — '}
          {CARRIER_SEND_STATE_LABELS[marker.state]}
          {marker.held && ' (محجوز)'}
        </p>
        <p className="text-xs text-gray-500">
          {formatDateTime(marker.createdAt)} · {marker.targetCarrier}
          {marker.carrierShippingId && ` · ${marker.carrierShippingId}`}
        </p>
        {marker.closeKind && <p className="text-xs text-gray-600">{CLOSE_KIND_LABELS[marker.closeKind]}</p>}
        {marker.stale && <p className="text-xs text-amber-700">{STALE_LINE}</p>}
      </div>

      {marker.held && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {HELD_LINE}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {canUpdate && marker.state === 'PENDING' && !marker.held && (
          <Button type="button" size="sm" onClick={handleDispatch} disabled={busy}>
            إرسال الآن
          </Button>
        )}
        {canClose && marker.state === 'PENDING' && marker.held && (
          <Button type="button" size="sm" onClick={handleSendAgain} disabled={busy}>
            {SHIPMENT_CHECK_LABEL}
          </Button>
        )}
        {canClose && isRejectedOrClosed && (
          <Button type="button" size="sm" onClick={handleSendAgain} disabled={busy}>
            {RESEND_AFTER_CHECK_LABEL}
          </Button>
        )}
      </div>

      {canClose && isOpen && (
        <CloseCarrierSendForm key={marker.id} pending={busy} onSubmit={handleClose} />
      )}

      {rows.length > 0 && (
        <div className="flex flex-col gap-3">
          {rows.map((failure) => (
            <OrderSystemFailureItem
              key={failure.id}
              failure={failure}
              order={order}
              canMarkSeen={canUpdate}
              isMarkingSeen={markSeenMutation.isPending && markSeenMutation.variables?.id === failure.id}
              onMarkSeen={(row) => markSeenMutation.mutate(row)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CarrierSendPanel({ order }: { order: Order }) {
  const canUpdate = useHasPermission(PERMISSION_CODES.ORDERS_UPDATE);
  const { data: markers } = useCarrierSendsForOrder(order.id);
  const { data: failuresPages } = useOrderSystemFailures(order.id);
  const oldShipmentMutation = useOldShipmentCancelledByHand();

  const marker: CarrierSendView | null = markers?.[0] ?? null;
  const failures = failuresPages?.pages.flatMap((page) => page.data) ?? [];
  const oldShipmentRows = oldShipmentRowsOf(failures);
  if (!marker && oldShipmentRows.length === 0) return null;

  const handleOldShipmentCancelled = (row: OldShipmentRow) =>
    oldShipmentMutation
      .mutateAsync({
        orderId: order.id,
        oldShippingId: row.shippingId,
        oldCompanyId: row.oldCompanyId,
      })
      .then(() => toast.success('تم تسجيل إلغاء الشحنة القديمة يدوياً'))
      .catch((err: unknown) =>
        toast.error(getApiErrorMessage(err, 'تعذر تسجيل إلغاء الشحنة القديمة')),
      );

  return (
    <section className="mt-6 flex flex-col gap-4 rounded-xl bg-gray-50 p-4">
      <h3 className="text-lg font-bold text-primary">إرسال شركة الشحن</h3>

      {marker && (
        <CarrierSendMarkerBlock order={order} marker={marker} rows={markerRowsOf(failures, marker.id)} />
      )}

      {canUpdate &&
        oldShipmentRows.map((row) => (
          <div key={`${row.oldCompanyId}:${row.shippingId}`} className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-700">
              الشحنة القديمة {row.shippingId} ما زالت تحتاج إلغاءً لدى شركة الشحن السابقة
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleOldShipmentCancelled(row)}
              disabled={oldShipmentMutation.isPending}
            >
              تسجيل إلغاء الشحنة {row.shippingId} يدوياً
            </Button>
          </div>
        ))}
    </section>
  );
}
