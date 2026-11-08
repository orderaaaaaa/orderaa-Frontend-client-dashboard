import { useOrderlessVariantAvailabilityQuery } from '@/services/warehouses';
import type { OrderlessAvailabilityTarget } from '@/lib/api/warehouses';
import { VariantAvailabilitySelector } from './VariantAvailabilitySelector';
import type { Selection } from './variantAvailabilityModel';

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
  excludedLines?: number;
  currentLabel?: string;
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
  excludedLines,
  currentLabel,
}: OrderlessVariantAvailabilityPanelProps) {
  const availability = useOrderlessVariantAvailabilityQuery(
    productId,
    targetStatus,
    quantity,
    draft,
  );

  return (
    <VariantAvailabilitySelector
      productId={productId}
      productName={productName}
      variants={availability.data ?? []}
      selection={selection}
      onChange={onChange}
      availabilityLoading={availability.isLoading}
      availabilityError={availability.isError ? availability.error : null}
      onRetry={() => void availability.refetch()}
      maxHeightClassName={maxHeightClassName}
      className={className}
      excludedLines={excludedLines}
      currentLabel={currentLabel}
    />
  );
}
