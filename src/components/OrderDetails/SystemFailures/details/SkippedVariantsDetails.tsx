import { useStatusLabel } from '@/hooks/useStatusLabel';
import { mapOrderProductToVariantInfo, type OrderProduct } from '@/types/orders';
import type { StockMovementSkippedDetails } from '@/types/orderSystemFailures';
import { DetailField, DetailGrid, EMPTY_VALUE } from './DetailFields';

const variantNameOf = (variantId: number, orderProducts: OrderProduct[]) => {
  const orderProduct = orderProducts.find((op) => op.variantId === variantId);
  if (!orderProduct) return `منتج غير موجود في الطلب (رقم النوع ${variantId})`;
  const info = mapOrderProductToVariantInfo(orderProduct);
  const attributes = info.attributes.map((attribute) => attribute.value).join(' / ');
  return attributes ? `${info.productName} - ${attributes}` : info.productName;
};

export function SkippedVariantsDetails({
  details,
  orderProducts,
}: {
  details: StockMovementSkippedDetails;
  orderProducts: OrderProduct[];
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
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500">المنتجات التي لم يتم تحريك مخزونها</span>
        <ul className="list-disc ps-5 text-sm">
          {details.variantIds.map((variantId) => (
            <li key={variantId}>{variantNameOf(variantId, orderProducts)}</li>
          ))}
        </ul>
        {!!details.variantIdsTruncatedCount && (
          <span className="text-xs text-gray-500">
            و{details.variantIdsTruncatedCount} منتجات أخرى
          </span>
        )}
      </div>
    </div>
  );
}
