import { FAILURE_REASON_KIND_LABELS } from '@/constants/orderSystemFailures';
import type { ShipmentDispatchFailureReason } from '@/types/orderSystemFailures';
import { DetailField, DetailGrid } from './DetailFields';
import { StockShortageDetails } from './StockShortageDetails';

export function FailureReasonDetails({ reason }: { reason: ShipmentDispatchFailureReason }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-gray-600">
        السبب: {FAILURE_REASON_KIND_LABELS[reason.kind]}
      </span>
      {reason.kind === 'STOCK_SHORTAGE' && <StockShortageDetails shortage={reason} />}
      {reason.kind === 'CARRIER_REJECTED' && (
        <DetailGrid>
          <DetailField label="العملية" ltr>
            {reason.operation}
          </DetailField>
          <DetailField label="رد شركة الشحن">{reason.carrierText}</DetailField>
        </DetailGrid>
      )}
      {reason.kind === 'REJECTED' && (
        <DetailGrid>
          <DetailField label="رمز الخطأ" ltr>
            {reason.errorCode}
          </DetailField>
        </DetailGrid>
      )}
      {reason.kind === 'UNEXPECTED' && (
        <DetailGrid>
          <DetailField label="نوع الخطأ" ltr>
            {reason.errorName}
          </DetailField>
          <DetailField label="الرسالة" ltr>
            {reason.message}
          </DetailField>
        </DetailGrid>
      )}
    </div>
  );
}
