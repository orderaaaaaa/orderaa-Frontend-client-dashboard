import { FAILURE_REASON_KIND_LABELS } from '@/constants/orderSystemFailures';
import {
  AVAILABLE_STOCK_WOULD_GO_NEGATIVE_CODE,
  AVAILABLE_WAREHOUSE_NOT_SET_CODE,
} from '@/lib/api/stockShortage';
import type { ShipmentDispatchFailureReason } from '@/types/orderSystemFailures';
import { AvailableStockWouldGoNegativeNotice } from './AvailableStockWouldGoNegativeNotice';
import { AvailableWarehouseNotSetNotice } from './AvailableWarehouseNotSetNotice';
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
      {reason.kind === 'REJECTED' &&
        (reason.errorCode === AVAILABLE_WAREHOUSE_NOT_SET_CODE ? (
          <AvailableWarehouseNotSetNotice />
        ) : reason.errorCode === AVAILABLE_STOCK_WOULD_GO_NEGATIVE_CODE ? (
          <AvailableStockWouldGoNegativeNotice />
        ) : (
          <DetailGrid>
            <DetailField label="رمز الخطأ" ltr>
              {reason.errorCode}
            </DetailField>
          </DetailGrid>
        ))}
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
