import { useI18n } from '@/i18n/I18nProvider';
import type { AvailableStockRefusalLine } from '@/lib/api/stockShortage';

export function AvailableStockWouldGoNegativeNotice({
  warehouseName,
  lines = [],
}: {
  warehouseName: string;
  lines?: AvailableStockRefusalLine[];
}) {
  const { t } = useI18n();
  const heading = t('stockShortage.availableWouldGoNegative', { warehouse: warehouseName });
  if (lines.length === 0) {
    return <p className="text-sm text-red-700 font-medium">{heading.replace(/:$/, '')}</p>;
  }
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-red-700 font-medium">{heading}</p>
      <ul className="list-disc ps-5 text-sm text-red-600">
        {lines.map((line, index) => (
          <li key={`${line.variantId}-${index}`}>
            {t(
              line.variantLabel ? 'stockShortage.availableLine' : 'stockShortage.availableLineNoVariant',
              {
                product: line.productName,
                variant: line.variantLabel,
                available: line.available,
                change: line.change,
                after: line.after,
              }
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
