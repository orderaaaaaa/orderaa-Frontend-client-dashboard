import { useStatusLabel } from '@/hooks/useStatusLabel';
import { integrationLabelOf } from '@/lib/shippingCompanies';
import type {
  CancelledLaneMovedLine,
  CancelledLaneUnmovedLine,
  CarrierCancelledLaneAppliedDetails,
  CarrierCancelledLaneStockDetails,
} from '@/types/orderSystemFailures';
import { DetailField, DetailGrid, EMPTY_VALUE } from './DetailFields';

const productLabelOf = (productName: string, variantLabel: string) =>
  [productName, variantLabel].filter((part) => part !== '').join(' - ') || EMPTY_VALUE;

const movedLineText = (line: CancelledLaneMovedLine) =>
  `${productLabelOf(line.productName, line.variantLabel)}: من ${line.fromWarehouseName ?? EMPTY_VALUE} إلى ${line.toWarehouseName ?? EMPTY_VALUE}، الكمية ${line.quantity} (القاعدة رقم ${line.ruleId})`;

const unmovedLineText = (line: CancelledLaneUnmovedLine) =>
  `${productLabelOf(line.productName, line.variantLabel)}: ${
    line.warehouseName === null
      ? 'لا توجد حركة مخزون مسجلة؛ تحقق من المخزون'
      : `آخر حركة مسجلة وضعت الكمية في ${line.warehouseName}؛ التحويلات أو التسويات اللاحقة غير ظاهرة، تحقق من المخزون`
  }`;

export function CancelledLaneAppliedDetails({ details }: { details: CarrierCancelledLaneAppliedDetails }) {
  const { getStatusLabel } = useStatusLabel();

  return (
    <DetailGrid>
      <DetailField label="شركة الشحن">{integrationLabelOf(details.carrier) ?? details.carrier}</DetailField>
      <DetailField label="الحالة كما أرسلتها شركة الشحن" ltr>
        {details.rawStatus}
      </DetailField>
      <DetailField label="الحالة المقابلة في النظام">{getStatusLabel(details.incomingStatus)}</DetailField>
      <DetailField label="سبب إلغاء الطلب">{details.cancelReason ?? EMPTY_VALUE}</DetailField>
    </DetailGrid>
  );
}

export function CancelledLaneStockDetails({ details }: { details: CarrierCancelledLaneStockDetails }) {
  const { getStatusLabel } = useStatusLabel();

  return (
    <div className="flex flex-col gap-3">
      <DetailGrid>
        <DetailField label="من حالة">{getStatusLabel(details.fromStatus)}</DetailField>
        <DetailField label="الحالة المقابلة في النظام">{getStatusLabel(details.incomingStatus)}</DetailField>
      </DetailGrid>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500">المنتجات التي تحركت مخزونها</span>
        {details.moved.length === 0 ? (
          <span className="text-sm font-medium">{EMPTY_VALUE}</span>
        ) : (
          <ul className="list-disc ps-5 text-sm">
            {details.moved.map((line) => (
              <li key={`${line.ruleId}-${line.productName}-${line.variantLabel}`}>{movedLineText(line)}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500">المنتجات التي لم تتحرك مخزونها</span>
        {details.unmoved.length === 0 ? (
          <span className="text-sm font-medium">{EMPTY_VALUE}</span>
        ) : (
          <ul className="list-disc ps-5 text-sm">
            {details.unmoved.map((line) => (
              <li key={`${line.productName}-${line.variantLabel}`}>{unmovedLineText(line)}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
