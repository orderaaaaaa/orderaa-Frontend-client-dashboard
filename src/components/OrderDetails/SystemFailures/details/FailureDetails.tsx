import { useStatusLabel } from '@/hooks/useStatusLabel';
import {
  AUTOMATION_MAPPING_NOT_SAVED_REASON_LABELS,
  AUTOMATION_NOT_SENT_REASON_LABELS,
  ORDER_SHADOWED_REASON_LABELS,
  SCHEDULED_TRANSITION_JOB_LABELS,
  SHIPMENT_MISSING_ADDRESS_FIELD_LABELS,
} from '@/constants/orderSystemFailures';
import type { Order } from '@/types/orders';
import type { OrderSystemFailure } from '@/types/orderSystemFailures';
import { CarrierDetails } from './CarrierDetails';
import { DetailField, DetailGrid, EMPTY_VALUE, formatDetailValue } from './DetailFields';
import { FailureReasonDetails } from './FailureReasonDetails';
import { GenericDetails } from './GenericDetails';
import { isStoreUpdateNotAppliedFailure, narrowFailureDetails } from './guards';
import { SkippedVariantsDetails } from './SkippedVariantsDetails';
import { StoreUpdateDetails } from './StoreUpdateDetails';

const labelOf = <K extends string>(labels: Record<K, string>, value: K) => labels[value] ?? value;

const SWITCH_DEACTIVATED_NOTE = 'تم إيقاف الإرسال التلقائي للشحن لهذا الطلب';

export function FailureDetails({
  failure,
  order,
}: {
  failure: Pick<OrderSystemFailure, 'code' | 'details'>;
  order: Order;
}) {
  const { getStatusLabel } = useStatusLabel();
  const narrowed = narrowFailureDetails(failure);

  if (!narrowed) {
    return failure.details ? <GenericDetails details={failure.details} /> : null;
  }

  if (isStoreUpdateNotAppliedFailure(narrowed)) {
    return <StoreUpdateDetails details={narrowed.details} order={order} />;
  }

  switch (narrowed.code) {
    case 'CARRIER_STATUS_UNMAPPED':
    case 'CARRIER_STATUS_IGNORED_STALE':
    case 'CARRIER_STATUS_IGNORED_PARTIAL_RETURN':
    case 'CARRIER_STATUS_NOT_APPLIED':
      return <CarrierDetails details={narrowed.details} />;
    case 'SHIPMENT_NOT_CREATED_MISSING_ADDRESS':
      return (
        <DetailGrid>
          <DetailField label="البيانات الناقصة">
            {narrowed.details.missing
              .map((field) => labelOf(SHIPMENT_MISSING_ADDRESS_FIELD_LABELS, field))
              .join('، ') || EMPTY_VALUE}
          </DetailField>
          {narrowed.details.switchDeactivated && (
            <DetailField label="ملاحظة">{SWITCH_DEACTIVATED_NOTE}</DetailField>
          )}
        </DetailGrid>
      );
    case 'SHIPMENT_NOT_CREATED_MISSING_PHONE':
      return narrowed.details.switchDeactivated ? (
        <DetailGrid>
          <DetailField label="ملاحظة">{SWITCH_DEACTIVATED_NOTE}</DetailField>
        </DetailGrid>
      ) : null;
    case 'SHIPMENT_DISPATCH_FAILED':
      return (
        <div className="flex flex-col gap-3">
          <DetailGrid>
            <DetailField label="عند">إطلاق الطلب المعلّق</DetailField>
            {narrowed.details.companyName && (
              <DetailField label="شركة الشحن">{narrowed.details.companyName}</DetailField>
            )}
          </DetailGrid>
          <FailureReasonDetails reason={narrowed.details.reason} />
        </div>
      );
    case 'AUTOMATION_NOT_SENT':
      return (
        <DetailGrid>
          <DetailField label="مزود الأتمتة" ltr>
            {narrowed.details.provider}
          </DetailField>
          <DetailField label="السبب">
            {labelOf(AUTOMATION_NOT_SENT_REASON_LABELS, narrowed.details.reason)}
          </DetailField>
        </DetailGrid>
      );
    case 'AUTOMATION_SEND_FAILED':
      return (
        <DetailGrid>
          <DetailField label="مزود الأتمتة" ltr>
            {narrowed.details.provider}
          </DetailField>
          <DetailField label="رمز الاستجابة" ltr>
            {formatDetailValue(narrowed.details.httpStatus)}
          </DetailField>
          <DetailField label="رسالة المزود" ltr>
            {formatDetailValue(narrowed.details.providerMessage)}
          </DetailField>
        </DetailGrid>
      );
    case 'AUTOMATION_MAPPING_NOT_SAVED':
      return (
        <DetailGrid>
          <DetailField label="مزود الأتمتة" ltr>
            {narrowed.details.provider}
          </DetailField>
          <DetailField label="السبب">
            {labelOf(AUTOMATION_MAPPING_NOT_SAVED_REASON_LABELS, narrowed.details.reason)}
          </DetailField>
        </DetailGrid>
      );
    case 'AUTOMATION_RESULT_NOT_APPLIED':
      return (
        <DetailGrid>
          <DetailField label="مزود الأتمتة" ltr>
            {narrowed.details.provider}
          </DetailField>
          <DetailField label="النتيجة">{narrowed.details.feedbackLabel}</DetailField>
          <DetailField label="الملخص">{narrowed.details.feedbackSummary}</DetailField>
          <DetailField label="حالة الطلب وقتها">
            {getStatusLabel(narrowed.details.orderStatus)}
          </DetailField>
        </DetailGrid>
      );
    case 'AUTOMATION_STATUS_NOT_APPLIED':
      return (
        <div className="flex flex-col gap-3">
          <DetailGrid>
            <DetailField label="مزود الأتمتة" ltr>
              {narrowed.details.provider}
            </DetailField>
            <DetailField label="الحالة المطلوبة">
              {getStatusLabel(narrowed.details.targetStatus)}
            </DetailField>
          </DetailGrid>
          <FailureReasonDetails reason={narrowed.details.reason} />
        </div>
      );
    case 'STOCK_MOVEMENT_SKIPPED':
      return (
        <SkippedVariantsDetails
          details={narrowed.details}
          orderProducts={order.order_products ?? []}
        />
      );
    case 'SCHEDULED_TRANSITION_FAILED':
      return (
        <div className="flex flex-col gap-3">
          <DetailGrid>
            <DetailField label="المهمة">
              {labelOf(SCHEDULED_TRANSITION_JOB_LABELS, narrowed.details.job)}
            </DetailField>
            <DetailField label="الحالة المطلوبة">
              {getStatusLabel(narrowed.details.targetStatus)}
            </DetailField>
          </DetailGrid>
          <FailureReasonDetails reason={narrowed.details.reason} />
        </div>
      );
    case 'ORDER_SHADOWED':
      return (
        <DetailGrid>
          <DetailField label="السبب">
            {labelOf(ORDER_SHADOWED_REASON_LABELS, narrowed.details.reason)}
          </DetailField>
          {narrowed.details.price !== undefined && (
            <DetailField label="سعر الطلب">{formatDetailValue(narrowed.details.price)}</DetailField>
          )}
        </DetailGrid>
      );
    case 'SHADOW_ACTIVATION_FAILED':
      return <FailureReasonDetails reason={narrowed.details.reason} />;
    case 'STORE_UPDATE_FAILED':
      return (
        <div className="flex flex-col gap-3">
          <DetailGrid>
            <DetailField label="المتجر" ltr>
              {narrowed.details.provider}
            </DetailField>
            <DetailField label="رقم الطلب في المتجر" ltr>
              {narrowed.details.externalOrderId ?? EMPTY_VALUE}
            </DetailField>
          </DetailGrid>
          <FailureReasonDetails reason={narrowed.details.reason} />
        </div>
      );
    default:
      return failure.details ? <GenericDetails details={failure.details} /> : null;
  }
}
