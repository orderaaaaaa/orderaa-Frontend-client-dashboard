import { useI18n } from '@/i18n/I18nProvider';
import { mapOrderProductToVariantInfo, type OrderProduct } from '@/types/orders';
import type { VariantGenerationGapDetails as VariantGenerationGapPayload } from '@/types/orderSystemFailures';
import { DetailField, DetailGrid, EMPTY_VALUE } from './DetailFields';

export function VariantGenerationGapDetails({
  details,
  orderProducts,
}: {
  details: VariantGenerationGapPayload;
  orderProducts: OrderProduct[];
}) {
  const { t } = useI18n();
  const orderProduct = orderProducts.find((op) => op.productId === details.productId);
  return (
    <div className="flex flex-col gap-3">
      <DetailGrid>
        <DetailField label="المنتج">
          {orderProduct ? mapOrderProductToVariantInfo(orderProduct).productName : EMPTY_VALUE}
        </DetailField>
      </DetailGrid>
      <p className="text-sm text-amber-900">
        {t('products.gapReport.banner', {
          rows: details.rows.map((row) => row.label).join(', '),
        })}
      </p>
    </div>
  );
}
