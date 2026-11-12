import type { CustomerReturnUnit } from '@/types/customer-return';
import {
  returnShipmentContentOfPieces,
  variantPartsLabelOf,
} from '@/utils/partialDelivery/returnShipmentContent';

export const customerReturnUnitVariantLabelOf = (
  unit: CustomerReturnUnit,
): string =>
  variantPartsLabelOf(
    unit.variants
      .filter((variant) => variant.label.trim() && variant.value.trim())
      .map((variant) => ({
        name: variant.label,
        value: variant.value,
      })),
  );

export const customerReturnContentOf = (units: CustomerReturnUnit[]): string =>
  returnShipmentContentOfPieces(
    units.flatMap((unit) => {
      const name = unit.productName ?? unit.sku;
      if (!name) return [];
      return [
        {
          name,
          variantLabel: customerReturnUnitVariantLabelOf(unit),
        },
      ];
    }),
  );
