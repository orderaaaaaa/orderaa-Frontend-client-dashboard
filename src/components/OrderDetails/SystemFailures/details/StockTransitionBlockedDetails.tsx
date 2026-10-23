import { useStatusLabel } from '@/hooks/useStatusLabel';
import type {
  FailureStockShortage,
  FailureStockShortageBlock,
  StockTransitionBlockedDetails as StockTransitionBlockedPayload,
} from '@/types/orderSystemFailures';
import { DetailField, DetailGrid, EMPTY_VALUE } from './DetailFields';
import { StockShortageDetails } from './StockShortageDetails';

const toShortage = (
  details: StockTransitionBlockedPayload
): FailureStockShortage => {
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

  return (
    <div className="flex flex-col gap-3">
      <DetailGrid>
        <DetailField label="من حالة">
          {details.fromStatus ? getStatusLabel(details.fromStatus) : EMPTY_VALUE}
        </DetailField>
        <DetailField label="إلى حالة">{getStatusLabel(details.toStatus)}</DetailField>
      </DetailGrid>
      <StockShortageDetails shortage={toShortage(details)} />
    </div>
  );
}
