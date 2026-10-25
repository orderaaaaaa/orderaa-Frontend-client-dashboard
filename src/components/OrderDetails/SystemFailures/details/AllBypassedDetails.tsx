import { useStatusLabel } from '@/hooks/useStatusLabel';
import type { StockMovementAllBypassedDetails } from '@/types/orderSystemFailures';
import {
  DetailField,
  DetailGrid,
  EMPTY_VALUE,
  productLabelOf,
} from './DetailFields';

const ALL_BYPASSED_NOTE =
  'نُقل الطلب دون حركة مخزون، لأن مرحلة المخزون السابقة لهذه المنتجات لم تُسجَّل. لم يتغير الرصيد بسبب هذا الطلب، ولا يلزم أي إجراء.';

export function AllBypassedDetails({
  details,
}: {
  details: StockMovementAllBypassedDetails;
}) {
  const { getStatusLabel } = useStatusLabel();

  return (
    <div className="flex flex-col gap-3">
      <DetailGrid>
        <DetailField label="من حالة">
          {details.fromStatus ? getStatusLabel(details.fromStatus) : EMPTY_VALUE}
        </DetailField>
        <DetailField label="إلى حالة">{getStatusLabel(details.toStatus)}</DetailField>
        <DetailField label="ملاحظة">{ALL_BYPASSED_NOTE}</DetailField>
      </DetailGrid>
      <ul className="list-disc ps-5 text-sm">
        {details.lines.map((line, index) => (
          <li key={index}>
            {productLabelOf(line.productName, line.variantLabel)}
          </li>
        ))}
      </ul>
    </div>
  );
}
