import { useOrderlessVariantAvailabilityQuery } from '@/services/warehouses';
import { useProductVariantsOptions } from '@/services/orders';
import type { OrderlessAvailabilityTarget } from '@/lib/api/warehouses';
import { VariantAvailabilitySelector } from './VariantAvailabilitySelector';
import type { CatalogAttribute, Selection } from './variantAvailabilityModel';

interface OrderlessVariantAvailabilityPanelProps {
  productId: number;
  productName: string;
  targetStatus: OrderlessAvailabilityTarget;
  quantity: number;
  draft: Record<string, number>;
  selection: Selection;
  onChange?: (selection: Selection) => void;
  maxHeightClassName?: string;
  className?: string;
}

export function OrderlessVariantAvailabilityPanel({
  productId,
  productName,
  targetStatus,
  quantity,
  draft,
  selection,
  onChange,
  maxHeightClassName,
  className,
}: OrderlessVariantAvailabilityPanelProps) {
  const catalog = useProductVariantsOptions(productId);
  const availability = useOrderlessVariantAvailabilityQuery(
    productId,
    targetStatus,
    quantity,
    draft,
  );

  const attributes: CatalogAttribute[] = (catalog.data ?? []).map((group) => ({
    attributeId: group.attributeId,
    attributeName: group.displayName || group.attribute,
    options: group.options.map((option) => ({
      optionId: option.id,
      optionName: option.displayName || option.name,
    })),
  }));

  return (
    <VariantAvailabilitySelector
      productName={productName}
      attributes={attributes}
      variants={availability.data ?? []}
      selection={selection}
      onChange={onChange}
      isLoading={catalog.isLoading || availability.isLoading}
      isError={catalog.isError || availability.isError}
      maxHeightClassName={maxHeightClassName}
      className={className}
    />
  );
}
