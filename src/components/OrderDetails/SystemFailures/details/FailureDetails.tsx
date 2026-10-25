import { useStatusLabel } from '@/hooks/useStatusLabel';
import { integrationLabelOf } from '@/lib/shippingCompanies';
import {
  AUTOMATION_MAPPING_NOT_SAVED_REASON_LABELS,
  AUTOMATION_NOT_SENT_REASON_LABELS,
  ORDER_SHADOWED_REASON_LABELS,
  SCHEDULED_TRANSITION_JOB_LABELS,
  SHIPMENT_MISSING_ADDRESS_FIELD_LABELS,
  shipmentCarrierSendSentenceOf,
} from '@/constants/orderSystemFailures';
import type { Order } from '@/types/orders';
import type {
  OrderSystemFailure,
  ShipmentCarrierSendDetails,
} from '@/types/orderSystemFailures';
import { formatStockShortageLines } from '@/utils/apiError';
import { CancelledLaneAppliedDetails, CancelledLaneStockDetails } from './CancelledLaneDetails';
import { CarrierDetails } from './CarrierDetails';
import { DetailField, DetailGrid, EMPTY_VALUE, formatDetailValue } from './DetailFields';
import { FailureReasonDetails } from './FailureReasonDetails';
import { GenericDetails } from './GenericDetails';
import { isStoreUpdateNotAppliedFailure, narrowFailureDetails } from './guards';
import { AllBypassedDetails } from './AllBypassedDetails';
import { BypassedVariantsDetails } from './BypassedVariantsDetails';
import { SkippedVariantsDetails } from './SkippedVariantsDetails';
import { StockTransitionBlockedDetails } from './StockTransitionBlockedDetails';
import { StoreUpdateDetails } from './StoreUpdateDetails';

const labelOf = <K extends string>(labels: Record<K, string>, value: K) => labels[value] ?? value;

const SWITCH_DEACTIVATED_NOTE = 'كان الطلب قيد التحويل لشركة شحن أخرى، فتم إلغاء تفعيل الشحنة السابقة';

const companyNameOf = (order: Order, companyId: number) => {
  const ref =
    order.shippingCompanyRef?.id === companyId
      ? order.shippingCompanyRef
      : order.shipping_ids?.find((row) => row.shippingCompanyId === companyId)?.shippingCompanyRef;
  return ref?.name ?? null;
};

const switchOldShipmentClauseOf = (details: ShipmentCarrierSendDetails) => {
  if (details.operation !== 'SWITCH' || !details.sourceCarrier || !details.oldShippingId) return '';
  const carrier = integrationLabelOf(details.sourceCarrier) ?? details.sourceCarrier;
  return `؛ تم إلغاء الشحنة ${details.oldShippingId} لدى ${carrier} يدوياً`;
};

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
    case 'CARRIER_STATUS_IGNORED_OUTSIDE_WINDOW':
    case 'CARRIER_STATUS_NOT_APPLIED':
    case 'CARRIER_STATUS_CORRECTED':
    case 'CARRIER_RETURN_AT_MERCHANT':
      return <CarrierDetails details={narrowed.details} />;
    case 'CARRIER_CANCELLED_LANE_APPLIED':
      return <CancelledLaneAppliedDetails details={narrowed.details} />;
    case 'CARRIER_CANCELLED_LANE_STOCK':
      return <CancelledLaneStockDetails details={narrowed.details} />;
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
    case 'SHIPMENT_UPDATE_NOT_SENT':
    case 'SHIPMENT_OUTCOME_UNKNOWN': {
      const sentence = shipmentCarrierSendSentenceOf(
        narrowed.code,
        narrowed.details.reason,
        narrowed.details.carrier
      );
      return (
        <DetailGrid>
          <DetailField label="شركة الشحن" ltr>
            {narrowed.details.carrier}
          </DetailField>
          <DetailField label="التفاصيل">
            {sentence
              ? `${sentence}${switchOldShipmentClauseOf(narrowed.details)}`
              : EMPTY_VALUE}
          </DetailField>
        </DetailGrid>
      );
    }
    case 'CARRIER_MESSAGE_AFTER_SWITCH':
      return (
        <DetailGrid>
          <DetailField label="شركة الشحن السابقة" ltr>
            {narrowed.details.carrier}
          </DetailField>
          <DetailField label="رقم الشحنة" ltr>
            {narrowed.details.shippingId}
          </DetailField>
        </DetailGrid>
      );
    case 'OLD_SHIPMENT_STILL_LIVE':
      return (
        <DetailGrid>
          <DetailField label="شركة الشحن السابقة">
            {companyNameOf(order, narrowed.details.oldCompanyId) ?? EMPTY_VALUE}
          </DetailField>
          <DetailField label="رقم الشحنة" ltr>
            {narrowed.details.shippingId}
          </DetailField>
        </DetailGrid>
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
          {(narrowed.details.feedbackLabel !== undefined ||
            narrowed.details.feedbackSummary !== undefined) && (
            <DetailGrid>
              {narrowed.details.feedbackLabel !== undefined && (
                <DetailField label="النتيجة">{narrowed.details.feedbackLabel}</DetailField>
              )}
              {narrowed.details.feedbackSummary !== undefined && (
                <DetailField label="الملخص">{narrowed.details.feedbackSummary}</DetailField>
              )}
            </DetailGrid>
          )}
          {narrowed.details.stockLines !== undefined && narrowed.details.stockLines.length > 0 && (
            <p className="whitespace-pre-line text-sm text-red-700 font-medium">
              {formatStockShortageLines(narrowed.details.stockLines)}
            </p>
          )}
          {narrowed.details.stockSummary !== undefined && (
            <p className="text-sm text-red-700 font-medium">{narrowed.details.stockSummary}</p>
          )}
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
    case 'STOCK_MOVEMENT_BYPASSED':
      return <BypassedVariantsDetails details={narrowed.details} />;
    case 'STOCK_MOVEMENT_ALL_BYPASSED':
      return <AllBypassedDetails details={narrowed.details} />;
    case 'STOCK_TRANSITION_BLOCKED':
      return <StockTransitionBlockedDetails details={narrowed.details} />;
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
