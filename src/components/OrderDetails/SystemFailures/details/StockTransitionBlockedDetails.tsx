import { useStatusLabel } from '@/hooks/useStatusLabel';
import { useI18n } from '@/i18n/I18nProvider';
import type {
  FailureStockShortage,
  FailureStockShortageBlock,
  StockTransitionBlockedDetails as StockTransitionBlockedPayload,
} from '@/types/orderSystemFailures';
import { AVAILABLE_WAREHOUSE_NOT_SET_CODE } from '@/lib/api/stockShortage';
import { AvailableWarehouseNotSetNotice } from './AvailableWarehouseNotSetNotice';
import { DetailField, DetailGrid } from './DetailFields';
import { StockShortageDetails } from './StockShortageDetails';

const toShortage = (
  details: StockTransitionBlockedPayload
): FailureStockShortage | null => {
  if (!details.lines) return null;
  const blocks = new Map<string, FailureStockShortageBlock>();
  for (const line of details.lines) {
    const warehouseName = line.warehouseName ?? details.warehouseName ?? undefined;
    const warehouseId = line.warehouseId ?? null;
    const key = `${warehouseId ?? 'none'}|${warehouseName ?? ''}`;
    const block = blocks.get(key) ?? { warehouseId, warehouseName, lines: [] };
    block.lines.push(line);
    blocks.set(key, block);
  }
  return { code: 'INSUFFICIENT_STOCK_FOR_VARIANT', blocks: Array.from(blocks.values()) };
};

export function StockTransitionBlockedDetails({
  details,
}: {
  details: StockTransitionBlockedPayload;
}) {
  const { getStatusLabel } = useStatusLabel();
  const { t } = useI18n();
  const shortage = toShortage(details);
  const sameStatus = details.fromStatus === details.toStatus;
  const showWarehouse = !shortage && !!details.warehouseName;

  return (
    <div className="flex flex-col gap-3">
      {sameStatus && (
        <p className="text-sm font-medium text-[#1F1F1F]">
          {t('orderDetails.stockTransition.sameStatus', {
            status: getStatusLabel(details.fromStatus),
          })}
        </p>
      )}
      {(!sameStatus || showWarehouse) && (
        <DetailGrid>
          {!sameStatus && (
            <DetailField label="من حالة">{getStatusLabel(details.fromStatus)}</DetailField>
          )}
          {!sameStatus && (
            <DetailField label="إلى حالة">{getStatusLabel(details.toStatus)}</DetailField>
          )}
          {showWarehouse && <DetailField label="المخزن">{details.warehouseName}</DetailField>}
        </DetailGrid>
      )}
      {details.errorCode === AVAILABLE_WAREHOUSE_NOT_SET_CODE && <AvailableWarehouseNotSetNotice />}
      {shortage && <StockShortageDetails shortage={shortage} />}
    </div>
  );
}
